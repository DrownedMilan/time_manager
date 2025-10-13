#!/bin/bash
REALM="time-manager"
CONTAINER="keycloak"
EXPORT_PATH="/opt/keycloak/data/import"
LOCAL_PATH="./keycloak-data/import"

echo "=== Export complet du realm '${REALM}' depuis Keycloak ==="

docker exec -it $CONTAINER /opt/keycloak/bin/kc.sh export \
  --realm $REALM \
  --dir $EXPORT_PATH \
  # --users include

docker cp $CONTAINER:${EXPORT_PATH}/${REALM}-realm.json ${LOCAL_PATH}/${REALM}-realm.json

echo "=== Export complet terminé : ${LOCAL_PATH}/${REALM}-realm.json ==="
