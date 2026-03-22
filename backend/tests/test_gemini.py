from app.core.gemini import build_context_prompt

def test_build_context_prompt():
    # Arrange
    subtitles = [
        {"text": "こんにちは", "timestamp": 12.5},
        {"text": "今日はいい天気ですね", "timestamp": 15.0}
    ]
    user_message = "そうですね"
    
    # Act
    prompt = build_context_prompt(subtitles, user_message)
    
    # Assert
    assert "動画の字幕ログ:" in prompt
    assert "こんにちは" in prompt
    assert "今日はいい天気ですね" in prompt
    assert "ユーザーのコメント: そうですね" in prompt
