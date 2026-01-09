"""
Keycloak Admin API helper functions
"""
import os
import requests
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "time-manager")
KEYCLOAK_INTERNAL_URL = os.getenv("KEYCLOAK_INTERNAL_URL", "http://keycloak:8080")
KEYCLOAK_ADMIN_USER = os.getenv("KEYCLOAK_ADMIN", "admin")
KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")

# Cache for admin token
_admin_token: Optional[str] = None
_admin_token_expires_at: Optional[float] = None


def get_admin_token() -> str:
    """
    Get or refresh the Keycloak admin token.
    Uses caching to avoid unnecessary requests.
    """
    global _admin_token, _admin_token_expires_at

    # Check if we have a valid cached token
    import time
    if _admin_token and _admin_token_expires_at and time.time() < _admin_token_expires_at - 60:
        return _admin_token

    # Get new token
    token_url = f"{KEYCLOAK_INTERNAL_URL}/realms/master/protocol/openid-connect/token"
    
    data = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": KEYCLOAK_ADMIN_USER,
        "password": KEYCLOAK_ADMIN_PASSWORD,
    }

    try:
        response = requests.post(token_url, data=data, timeout=10)
        response.raise_for_status()
        token_data = response.json()
        
        _admin_token = token_data["access_token"]
        expires_in = token_data.get("expires_in", 60)
        _admin_token_expires_at = time.time() + expires_in
        
        return _admin_token
    except requests.RequestException as e:
        raise Exception(f"Failed to get Keycloak admin token: {e}")


def create_keycloak_user(
    email: str,
    username: str,
    password: str,
    first_name: str,
    last_name: str,
    phone_number: Optional[str] = None,
    realm_roles: Optional[List[str]] = None,
) -> str:
    """
    Create a user in Keycloak via Admin API.
    
    Returns:
        The Keycloak user ID (UUID)
    """
    admin_token = get_admin_token()
    
    # Create user payload
    user_payload = {
        "username": username,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "enabled": True,
        "emailVerified": False,
        "credentials": [
            {
                "type": "password",
                "value": password,
                "temporary": True,  # Force user to change password on first login
            }
        ],
    }

    # Add phone number if provided
    if phone_number:
        user_payload["attributes"] = {
            "phone_number": [phone_number]
        }

    # Create user
    create_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/users"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(create_url, json=user_payload, headers=headers, timeout=10)
        
        if response.status_code == 409:
            raise Exception(f"User with email {email} or username {username} already exists in Keycloak")
        
        response.raise_for_status()
        
        # Get the user ID from the Location header
        location = response.headers.get("Location")
        if not location:
            raise Exception("Keycloak did not return user location")
        
        # Extract user ID from location: /admin/realms/{realm}/users/{user-id}
        user_id = location.split("/")[-1]
        
        # Assign realm roles if provided
        if realm_roles:
            assign_realm_roles(user_id, realm_roles)
        
        return user_id
        
    except requests.RequestException as e:
        if hasattr(e, "response") and e.response is not None:
            error_detail = e.response.text
            raise Exception(f"Failed to create user in Keycloak: {error_detail}")
        raise Exception(f"Failed to create user in Keycloak: {e}")


def assign_realm_roles(user_id: str, roles: List[str]):
    """
    Assign realm roles to a Keycloak user.
    """
    admin_token = get_admin_token()
    
    # Get available realm roles
    roles_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/roles"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    
    try:
        # Get all realm roles
        response = requests.get(roles_url, headers=headers, timeout=10)
        response.raise_for_status()
        all_roles = response.json()
        
        # Filter to only the roles we want to assign
        roles_to_assign = [r for r in all_roles if r["name"].lower() in [role.lower() for role in roles]]
        
        if not roles_to_assign:
            # If no matching roles found, skip assignment
            return
        
        # Assign roles to user
        assign_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/users/{user_id}/role-mappings/realm"
        response = requests.post(assign_url, json=roles_to_assign, headers=headers, timeout=10)
        response.raise_for_status()
        
    except requests.RequestException as e:
        # Log error but don't fail user creation if role assignment fails
        print(f"Warning: Failed to assign roles to user {user_id}: {e}")


def delete_keycloak_user(keycloak_id: str):
    """
    Delete a user from Keycloak via Admin API.
    """
    admin_token = get_admin_token()
    
    delete_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/users/{keycloak_id}"
    headers = {
        "Authorization": f"Bearer {admin_token}",
    }
    
    try:
        response = requests.delete(delete_url, headers=headers, timeout=10)
        # 404 is OK if user doesn't exist
        if response.status_code not in (204, 404):
            response.raise_for_status()
    except requests.RequestException as e:
        # Log error but don't fail if deletion fails
        print(f"Warning: Failed to delete user {keycloak_id} from Keycloak: {e}")


def verify_user_password(keycloak_id: str, password: str) -> bool:
    """
    Verify a user's password by attempting to authenticate.
    
    Returns:
        True if password is correct, False otherwise
    """
    try:
        # Get user info to find username/email
        admin_token = get_admin_token()
        user_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/users/{keycloak_id}"
        headers = {
            "Authorization": f"Bearer {admin_token}",
        }
        
        response = requests.get(user_url, headers=headers, timeout=10)
        response.raise_for_status()
        user_data = response.json()
        
        username = user_data.get("username") or user_data.get("email")
        if not username:
            return False
        
        # Try to authenticate with the password
        token_url = f"{KEYCLOAK_INTERNAL_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/token"
        auth_data = {
            "grant_type": "password",
            "client_id": "frontend",  # Use the frontend client
            "username": username,
            "password": password,
        }
        
        auth_response = requests.post(token_url, data=auth_data, timeout=10)
        return auth_response.status_code == 200
        
    except requests.RequestException:
        return False


def change_keycloak_user_password(keycloak_id: str, new_password: str, temporary: bool = False):
    """
    Change a user's password in Keycloak via Admin API.
    
    Args:
        keycloak_id: The Keycloak user ID
        new_password: The new password
        temporary: Whether the password should be marked as temporary
    """
    admin_token = get_admin_token()
    
    # Reset password endpoint
    reset_password_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{KEYCLOAK_REALM}/users/{keycloak_id}/reset-password"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    
    password_payload = {
        "type": "password",
        "value": new_password,
        "temporary": temporary,
    }
    
    try:
        response = requests.put(reset_password_url, json=password_payload, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        if hasattr(e, "response") and e.response is not None:
            error_detail = e.response.text
            raise Exception(f"Failed to change password in Keycloak: {error_detail}")
        raise Exception(f"Failed to change password in Keycloak: {e}")
