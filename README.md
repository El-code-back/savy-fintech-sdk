<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/12233d9e-8bb9-4cb8-80a5-ccf6329fa724

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `GROQ_API_KEY` from https://console.groq.com/keys. Do not put private keys in variables starting with `VITE_`.
3. Run the app:
   `npm run dev`

## Savy assistant and deployment

The assistant uses Llama 3.1 8B through Groq. Browser requests go to `/api/chat`; the API key stays on the server. `GROQ_MODEL` can override the default model. Without a key the assistant explicitly shows that AI is not connected. No simulated answers are displayed.

For Vercel, add `GROQ_API_KEY` under Project Settings → Environment Variables, then redeploy. The `api/chat.ts` server function and SPA rewrites are included. Local development and `npm run preview` serve the same API handler. A static-only host will not serve the assistant API.

When a question is submitted, Groq receives the latest budget amounts, vault titles and goals, planned expenses, and up to 11 recent dialogue messages. Messages are held in memory for the current screen; there is no bank integration or automatic lending decision.

Credit scenarios use equal monthly payments and a user-entered annual rate, excluding fees and insurance. Personal suggestions consider the current reserve, monthly goals, and money taken from important vaults. The daily budget divides the unreserved balance by 30; runway divides that balance by average daily vault goals.

Validation: `npm run lint`, `npm test`, `npm run build`. API tests mock the model provider; real model responses require a valid key and network access. The demo API limits requests per client per server instance; a public production service should add account authentication and shared usage limits.
