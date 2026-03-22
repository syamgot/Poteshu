import asyncio
from google import genai
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def build_context_prompt(subtitles: list[dict], user_message: str) -> str:
    context = "動画の字幕ログ:\n"
    for sub in subtitles:
        context += f"- {sub.get('text')}\n"
    
    prompt = f"{context}\nユーザーのコメント: {user_message}"
    return prompt

async def stream_gemini_response(subtitles: list[dict], user_message: str):
    prompt = build_context_prompt(subtitles, user_message)
    system_instruction = (
        "あなたは私と一緒に家でYouTubeを見ている、元気で明るい女の子の友達です！"
        "敬語や丁寧語は厳禁で、仲の良い親友のようにタメ口（〜だよねっ！、〜じゃん！、ウケるー！等）で、絵文字も少し交えながら短く（2〜3文以内）話してください。"
        "また、私の意見にただ同意するだけでなく、「私はこうだと思うな〜」「えー、そうかな？」「ていうか○○じゃない？」など、あなた自身の素直な視点やツッコミ、独自の感想をしっかり交えて、会話のキャッチボールが弾むようにレスポンスしてください。"
    )
    
    try:
        response_stream = await client.aio.models.generate_content_stream(
            model=settings.MODEL_NAME,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
            yield "\n\n[System] ⚠️ APIの無料枠制限（1分間あたりのチャット回数上限）に到達しました。約1分ほど待ってから再度送信してください🙏"
        else:
            yield f"\n\n[System] ⚠️ AI通信エラー: {error_msg}"
