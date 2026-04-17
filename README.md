# Gepbot Frontend

Nuxt 3 SPA for the Gepbot chat interface.

## Stack

| Layer | Library |
|---|---|
| Framework | Nuxt 3 (SPA mode, `ssr: false`) |
| State (UI) | Pinia |
| Persistence | Dexie.js → IndexedDB |
| Reactivity | RxJS `liveQuery` → Vue refs |
| Virtualisation | Virtua `VList` |
| Markdown | marked + DOMPurify |
| Streaming | Fetch API + ReadableStream (SSE) |

## Setup

```bash
npm install
```

### Environment

Create a `.env` file in the project root:

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

The default is already `http://localhost:8000` if you skip this.

### Start the backend first

Follow the backend README to run `docker compose up -d --build gepbot`.

### Run the frontend

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
gepbot-frontend/
├── assets/css/main.css        # Global styles + CSS variables
├── components/
│   ├── ChatInput.vue           # Textarea + send button (auto-resize)
│   ├── ChatWindow.vue          # Virtua VList + auto-scroll
│   └── MessageBubble.vue       # User/assistant message rendering
├── composables/
│   ├── useChat.ts              # SSE streaming + conversation lifecycle
│   ├── useConversations.ts     # Dexie liveQuery → RxJS → Vue refs
│   └── useMarkdown.ts          # marked + DOMPurify renderer
├── db/index.ts                 # Dexie schema (conversations, messages)
├── layouts/default.vue         # Nav bar layout
├── pages/
│   ├── index.vue               # Chat page
│   └── history.vue             # Conversation history page
└── stores/chat.ts              # Pinia: activeConversationId, isStreaming
```

## SSE API Contract

The frontend `POST /chat` with:

```json
{
  "conversation_id": 1,
  "message": "Hello"
}
```

And expects an SSE stream of lines:

```
data: {"token": "Hello"}\n\n
data: {"token": " world"}\n\n
data: [DONE]\n\n
```

The `token` field can also be named `content`, `text`, or `delta`. Raw text (non-JSON) chunks are also supported.
