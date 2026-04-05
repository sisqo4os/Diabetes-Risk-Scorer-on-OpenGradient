# DiabetesRisk ◆ DApp — OpenGradient

A decentralised diabetes risk assessment dapp running on-chain inference via the **OpenGradient Network**.

- **Model:** `model_012_diabetes-risk-classifier.onnx`
- **Model CID:** `yfba4xoW_-qDtoSq6qt8ghR2w0lDMNGSjo-Dohv0TFc`
- **Input:** `{ "diab_feat": [[f0, f1, f2, f3, f4]] }` — float tensor `[1, 5]`
- **Inference modes:** VANILLA · TEE · ZKML

---

## Project Structure

```
diabetes-dapp/
├── public/
│   ├── index.html   ← Main UI
│   ├── style.css    ← All styles (dark-mode aware)
│   └── app.js       ← Inference logic & SDK call preview
├── vercel.json      ← Vercel static site config
├── .gitignore
└── README.md
```

---

## Deploy to GitHub

1. Create a new GitHub repository (e.g. `diabetes-risk-dapp`)

2. Inside the project folder, run:

```bash
git init
git add .
git commit -m "feat: initial DiabetesRisk DApp on OpenGradient"
git branch -M main
git remote add origin https://github.com/<your-username>/diabetes-risk-dapp.git
git push -u origin main
```

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm i -g vercel
vercel --prod
```

Follow the prompts. Vercel auto-detects `vercel.json` and serves `public/` as a static site.

### Option B — Vercel Dashboard (no CLI)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Other**
4. Root directory: leave as-is (the `vercel.json` handles routing)
5. Click **Deploy**

Your dapp will be live at `https://<project-name>.vercel.app`

---

## Going Live on OpenGradient (real inference)

Replace the client-side simulation in `app.js` with a backend API call to your Python server:

```python
# server.py  (FastAPI example)
import opengradient as og
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
alpha = og.Alpha(private_key="<YOUR_PRIVATE_KEY>")

class InferRequest(BaseModel):
    features: list[float]   # 5 values
    mode: str = "VANILLA"

@app.post("/infer")
async def infer(req: InferRequest):
    mode_map = {
        "VANILLA": og.InferenceMode.VANILLA,
        "TEE":     og.InferenceMode.TEE,
        "ZKML":    og.InferenceMode.ZKML,
    }
    result = alpha.infer(
        model_cid="yfba4xoW_-qDtoSq6qt8ghR2w0lDMNGSjo-Dohv0TFc",
        model_input={"diab_feat": [req.features]},
        inference_mode=mode_map[req.mode],
    )
    return result.model_output
```

Then fund your wallet with testnet OPG tokens:
👉 https://faucet.opengradient.ai

---

## Resources

| Resource | URL |
|---|---|
| OpenGradient Docs | https://docs.opengradient.ai |
| Block Explorer | https://explorer.opengradient.ai |
| Testnet Faucet | https://faucet.opengradient.ai |
| Model Hub | https://hub.opengradient.ai |
| SDK (PyPI) | https://pypi.org/project/opengradient |

---

> **Disclaimer:** This is a testnet demonstration. Not medical advice.
