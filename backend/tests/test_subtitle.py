from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_receive_subtitle():
    # Arrange
    payload = {
        "text": "こんにちは",
        "timestamp": 12.5
    }
    
    # Act
    response = client.post("/subtitle", json=payload)
    
    # Assert
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "received": "こんにちは"}
