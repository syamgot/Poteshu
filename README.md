# 🥔 Poteshu (ポテシュ)

「ポテチを食べながら親友とYouTubeを見る」ような感覚を再現するリアルタイムAIチャットシステム。
YouTubeの動的字幕（CC）をリアルタイムで抽出し、画面の話題についてGemini AIと語り合うことができます。

## 🌟 特徴
- **リアルタイム字幕共有**: Chrome拡張機能がYouTubeの「カラオケ方式」字幕をディバウンス処理し、整然とした文章にしてサーバーへ逐次送信します。
- **AIとの「友達」体験**: Gemini 2.5 Flashが直近10〜15分間の動画の文脈（コンテキスト）を記憶。最新の話題に食いつく仲の良い友達として、絵文字まじりのタメ口でAI独自にリアクションやツッコミを返します。
- **洗練された2ペインUI**: 流れる字幕のライブログと、LINE風のAIチャット画面を統合したモダンなダークモードレイアウト。

## 🛠️ 技術スタック
- **Backend**: Python 3.10+, FastAPI, `google-genai` SDK, SSE (Server-Sent Events)
- **Frontend**: HTML5, Vanilla JS, Tailwind CSS (CDN)
- **Extension**: Chrome Extension (Manifest V3), esbuild

## 🚀 セットアップ手順

### 1. サーバーの準備 (Backend)
```bash
# リポジトリのクローンとディレクトリ移動
git clone git@github.com:syamgot/Poteshu.git
cd Poteshu/backend

# 仮想環境の作成と依存パッケージのインストール
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# APIキーの設定
# backendディレクトリに `.env` ファイルを作成し、以下を記述してください
# GEMINI_API_KEY=AI_Studioで取得したあなたのAPIキー
```

### 2. サーバー起動
```bash
# 同ディレクトリ（backend）で実行
uvicorn app.main:app --reload --port 8000
```
> **注意**: AIの記憶力（字幕バッファサイズ）やAIの性格などは `backend/app/core/config.py` と `gemini.py` で簡単にチューニング可能です。

### 3. 拡張機能の導入 (Chrome Extension)
1. ChromeのURLバーに `chrome://extensions/` と入力して拡張機能管理画面を開きます。
2. 右上の「デベロッパー モード」をオンにします。
3. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックし、`Poteshu/extension` フォルダを選択します。

### 4. 遊ぶ
1. YouTubeで好きな動画を開き、**必ず動画プレイヤーの字幕（CC）をオン**にします。
2. ブラウザで [http://localhost:8000/](http://localhost:8000/) を開きます。
3. 左側のペインに現在見ている動画のタイトルと字幕が流れ始めたら準備完了！右側のチャット欄からAIに話しかけてみてください。
   (*※複数のYouTubeタブで同時に字幕をオンにするとAIが混乱するため、Poteshu利用時は動画は1タブのみに絞って再生してください*)
