# ChiefPilot TZI - Deployment Guide

## ✅ Currently Deployed

**Live URL:** https://chiefpilot-tzi.vercel.app

**Status:** ✅ Production deployment successful

---

## Quick Start

This application is configured for deployment to **Vercel** with automatic builds and environment variable management.

---

## Vercel Deployment

### Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier available)
- [Vercel CLI](https://vercel.com/docs/cli) installed: `npm install -g vercel`
- Git repository with code pushed

### Method 1: Using Vercel CLI (Recommended)

```bash
# Navigate to project directory
cd web-apps/chiefpilot/TZI-

# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Or use npm scripts
npm run deploy:vercel

# For development deployment (preview)
npm run deploy:vercel:dev
```

### Method 2: Using Makefile

```bash
# Production deployment
make deploy-vercel

# Development deployment
make deploy-vercel-dev
```

### Method 3: Import via Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Select the `web-apps/chiefpilot/TZI-` directory
5. Vercel will automatically detect the Node.js project
6. Add environment variables (see below)
7. Deploy

---

## Environment Variables

The application requires the following environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |
| `NODE_ENV` | Set to `production` for production builds | ❌ No |
| `PORT` | Server port (default: 3000) | ❌ No |

### Setting Environment Variables in Vercel

1. **Via CLI**: You'll be prompted during deployment
2. **Via Dashboard**: Go to Project Settings → Environment Variables
3. **In `vercel.json`**: Already configured to use `GEMINI_API_KEY`

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `.vercelignore` | Files to exclude from deployment |
| `package.json` | Deployment scripts: `deploy:vercel`, `deploy:vercel:dev` |
| `Makefile` | Deployment commands: `make deploy-vercel`, `make deploy-vercel-dev` |

---

## Vercel Configuration Details

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.cjs",
      "use": "@vercel/node",
      "config": {
        "memory": 3008,
        "maxDuration": 60
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.cjs"
    }
  ],
  "env": ["GEMINI_API_KEY"],
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

### Key Settings:

- **Memory**: 3008 MB (recommended for AI operations)
- **Max Duration**: 60 seconds (for longer AI API calls)
- **Build Command**: `npm run build` (Vite + esbuild)
- **Runtime**: Node.js with @vercel/node adapter

---

## Deployment Checklist

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Navigate to project: `cd web-apps/chiefpilot/TZI-`
- [ ] Build the project: `npm run build`
- [ ] Have GEMINI_API_KEY ready
- [ ] Deploy: `vercel --prod` or `npm run deploy:vercel`

---

## Post-Deployment

After deployment:

1. **Check the deployment URL** - https://chiefpilot-tzi.vercel.app
2. **Test the health endpoint**: `https://chiefpilot-tzi.vercel.app/api/health`
3. **Test AI endpoints**: Try `/api/gemini/think` or `/api/gemini/generate`

---

## Troubleshooting

### Build Failures

If the build fails:

1. **Check Node.js version**: Vercel uses Node.js 18+ by default. Ensure your local version matches.
2. **Check environment variables**: Make sure `GEMINI_API_KEY` is set in Vercel dashboard.
3. **Check build logs**: Vercel provides detailed logs in the deployment output.

### Runtime Errors

1. **API Key Missing**: Ensure `GEMINI_API_KEY` is set as an environment variable
2. **Memory Issues**: Increase memory in `vercel.json` if AI operations fail
3. **Timeout Issues**: Increase `maxDuration` in `vercel.json` if requests timeout

### Local Testing

To test locally before deploying:

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## Custom Domain

To add a custom domain:

1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., `tzi.yourdomain.com`)
3. Configure DNS records (Vercel provides instructions)
4. Wait for DNS propagation

---

## Monitoring

Vercel provides built-in monitoring:

- **Deployment logs**: View in Vercel dashboard
- **Function logs**: Check under "Functions" tab
- **Performance metrics**: Available in dashboard

---

## Notes

- Vercel automatically triggers deployments on Git pushes
- Each Git push to `main` branch triggers a new production deployment
- Preview deployments are created for pull requests
- The `dist/` directory is automatically created during build
