#!/bin/bash

# Script to export Keycloak realm via CLI

# Get script directory and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

REALM_NAME="time-manager"
CONTAINER_NAME="keycloak"
EXPORT_DIR="${PROJECT_ROOT}/import/keycloak"
OUTPUT_FILE="${EXPORT_DIR}/time-manager-realm.json"

# Create directory if it doesn't exist
mkdir -p "${EXPORT_DIR}"

echo "🛑 Stopping Keycloak for export..."
docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" stop keycloak

if [ $? -ne 0 ]; then
  echo "❌ Error stopping Keycloak"
  exit 1
fi

echo "⏳ Waiting for Keycloak to fully stop..."
sleep 3

echo "📥 Exporting realm ${REALM_NAME} via Keycloak CLI..."
# Export realm with users in a separate file (same_file)
# Use docker-compose run to access network and environment variables
cd "${PROJECT_ROOT}"

# Create temporary directory for export (avoids conflicts with volumes)
TEMP_EXPORT_DIR="${PROJECT_ROOT}/.keycloak_export_temp"
mkdir -p "${TEMP_EXPORT_DIR}"

# Use --file with --users same_file to create two files:
# - time-manager-realm.json (realm + config)
# - time-manager-users.json (users)
docker-compose run --rm \
  -v "${TEMP_EXPORT_DIR}:/opt/keycloak/data/export" \
  keycloak \
  export \
  --file /opt/keycloak/data/export/time-manager-realm.json \
  --realm ${REALM_NAME} \
  --users same_file

EXPORT_SUCCESS=$?

# With same_file, we'll have two files in the temporary directory:
# - time-manager-realm.json (realm config)
# - A users file (name may vary depending on Keycloak)
TEMP_REALM_FILE="${TEMP_EXPORT_DIR}/time-manager-realm.json"
# Search for users file (may be named differently)
TEMP_USERS_FILE=$(find "${TEMP_EXPORT_DIR}" -name "*users*.json" -type f 2>/dev/null | head -1)

# Destination files
REALM_FILE="${EXPORT_DIR}/time-manager-realm.json"
USERS_FILE="${EXPORT_DIR}/$(basename "${TEMP_USERS_FILE}" 2>/dev/null || echo "time-manager-users.json")"

if [ $EXPORT_SUCCESS -eq 0 ]; then
  # Copy files from temporary directory to final directory
  if [ -f "${TEMP_REALM_FILE}" ]; then
    cp "${TEMP_REALM_FILE}" "${REALM_FILE}"
    echo "✅ Realm export successful in ${REALM_FILE}"
    echo "📊 Realm file size: $(du -h "${REALM_FILE}" | cut -f1)"
    
    # Check realm content
    if command -v jq &> /dev/null; then
      if jq -e '.identityProviders | length > 0' "${REALM_FILE}" > /dev/null 2>&1; then
        IDP_COUNT=$(jq '.identityProviders | length' "${REALM_FILE}")
        echo "✅ ${IDP_COUNT} identity provider(s) exported"
      else
        echo "⚠️  No identity provider found in export"
      fi
      
      # Check if users are in realm file (case with same_file)
      if jq -e '.users | length > 0' "${REALM_FILE}" > /dev/null 2>&1; then
        USER_COUNT=$(jq '.users | length' "${REALM_FILE}")
        echo "✅ ${USER_COUNT} user(s) exported in realm file"
      fi
    fi
  else
    echo "⚠️  Export completed but realm file not found at ${TEMP_REALM_FILE}"
  fi
  
  # Check if users are in a separate file
  if [ -n "${TEMP_USERS_FILE}" ] && [ -f "${TEMP_USERS_FILE}" ]; then
    # Separate users file found
    cp "${TEMP_USERS_FILE}" "${USERS_FILE}"
    echo "✅ Users export successful in ${USERS_FILE}"
    echo "📊 Users file size: $(du -h "${USERS_FILE}" | cut -f1)"
    
    # Check users content
    if command -v jq &> /dev/null; then
      if jq -e '.users | length > 0' "${USERS_FILE}" > /dev/null 2>&1; then
        USER_COUNT=$(jq '.users | length' "${USERS_FILE}")
        echo "✅ ${USER_COUNT} user(s) exported"
      else
        echo "⚠️  No users found in export"
      fi
    fi
  fi
  
  # Clean up temporary directory
  rm -rf "${TEMP_EXPORT_DIR}"
  echo "🧹 Temporary directory cleaned"
else
  echo "❌ Error during export"
  # Clean up even on error
  rm -rf "${TEMP_EXPORT_DIR}"
  EXPORT_SUCCESS=1
fi

echo "🔄 Restarting Keycloak..."
# Use up -d instead of start to avoid mount issues
docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" up -d keycloak

if [ $? -eq 0 ]; then
  echo "✅ Keycloak restarted successfully"
else
  echo "⚠️  Error restarting Keycloak"
  echo "   You can restart it manually with: docker-compose up -d keycloak"
fi

# Exit with export error code
if [ $EXPORT_SUCCESS -ne 0 ]; then
  exit 1
fi

