# Run Ollama with QuickRNv2

## 1. Install Ollama
Download the installer for your operating system from https://ollama.com/download and install it. Start the Ollama app/service.

## 2. Download a model
Open Terminal (macOS/Linux) or PowerShell (Windows):

```bash
ollama pull qwen2.5:7b
ollama list
```

If your computer has limited memory, try a smaller model such as `qwen2.5:3b`. Larger models can produce stronger outputs but need more memory and may be slower.

## 3. Start QuickRN locally
In the repository folder:

```bash
npm install
npm run dev
```

Open the local Vite address printed in the terminal (usually http://localhost:5173). The development server proxies requests beginning with `/ollama` to Ollama at `127.0.0.1:11434`.

## 4. Generate question drafts
1. Sign in using an administrator account with the Firebase custom claim `admin: true`.
2. Open **Administrator tools → Question Studio**.
3. Click **Connect Ollama**.
4. Choose the model, enter a topic, and select a batch size.
5. Generate the draft, inspect and edit the JSON, and then publish it.

If connection fails, check that the Ollama app is running and that `ollama list` returns your model. Do not expose port 11434 to the public internet.

## Important deployment distinction
Ollama is running on your own computer. It helps author content locally, while Vercel deploys the QuickRN website. The deployed Vercel site cannot reach your computer's `localhost`. To generate from the live site later, deploy a protected server-side AI endpoint with authentication, rate limits, and secret management. Do not put an Ollama cloud key or admin credential in browser code.

## Official references
- Installer: https://ollama.com/download
- Quickstart: https://github.com/ollama/ollama/blob/main/docs/quickstart.mdx
- API: https://github.com/ollama/ollama/blob/main/docs/api.md
- Server configuration and network security: https://github.com/ollama/ollama/blob/main/docs/faq.mdx

## Give your administrator account access

The Question Studio appears only for accounts with the Firebase custom claim `admin: true`. This claim must be set from a trusted machine using a Firebase service account; never set it from the browser.

1. Install dependencies with `npm install`.
2. In Firebase Console → Project settings → Service accounts, create/download a private service-account key for the existing project. Store it outside the repository and never commit or share it.
3. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to that local JSON key file path.
4. Run `npm run set-admin -- your-admin-email@example.com`.
5. Sign out of QuickRN and sign back in so Firebase refreshes the ID token.

This grants powerful publishing permissions. Only assign the claim to trusted administrator accounts.
