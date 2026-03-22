import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_chat_endpoint_integration():
    if settings.GEMINI_API_KEY == "ここに取得したAPIキーを貼り付けてください":
        pytest.skip("API key not set, skipping integration test.")
        
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/chat", json={"message": "テストだよ！返事して！"})
        assert response.status_code == 200
        
        # We read the streaming text content
        text = ""
        async for chunk in response.aiter_text():
            text += chunk
        
        print("\n\n=== AI Response ===")
        print(text)
        print("===================\n")
        assert len(text) > 0

# @pytest.mark.asyncio
# async def test_get_stream_exists():
#     async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
#         async with ac.stream("GET", "/stream") as response:
#             assert response.status_code == 200
