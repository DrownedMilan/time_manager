from app.models import User, UserCreate

def test_user_model_normalization():
    data = {
        "first_name": "  alice ",
        "last_name": "doe ",
        "email": "  Alice@EXAMPLE.com ",
        "phone_number": "+33 6 12 34 56 78",
    }

    # On passe par le schéma UserCreate pour appliquer les validateurs
    user_data = UserCreate(**data).model_dump()
    user = User(**user_data)

    assert user.first_name == "Alice"
    assert user.last_name == "DOE"
    assert user.email == "alice@example.com"


def test_create_user_endpoint(client):
    payload = {
        "first_name": "Bob",
        "last_name": "Marley",
        "email": "bob@marley.com",
        "phone_number": "+33699998888"
    }

    response = client.post("/users/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Bob"
    assert data["last_name"] == "MARLEY"  # modèle met le nom en majuscules
    assert data["email"] == "bob@marley.com"
