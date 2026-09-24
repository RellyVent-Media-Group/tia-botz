# Character API - Vercel Deployment

This is the Character API adapted for Vercel serverless deployment.

## Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run locally:
```bash
python api/index.py
```

3. Test health endpoint:
```bash
curl http://localhost:8001/api/character-health
```

## Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard if needed

## Environment Variables

The API will use character data from the character integration modules. Make sure all required Python dependencies are in `requirements.txt`.

## API Endpoints

- `GET /api/character-health` - Health check
- `GET /api/characters` - Get all characters
- `GET /api/characters/:id` - Get specific character
- `GET /api/characters/search/:query` - Search characters
- `GET /api/characters/random` - Get random character
- `GET /api/content/creators` - Get content creators
- `GET /api/budget/summary` - Get budget summary
- `GET /api/analytics/character-performance` - Get character performance

## Notes

- This is a simplified version adapted for Vercel serverless functions
- For full functionality, ensure character data files are accessible
- Discord bot will need to update CHARACTER_API_URL to the deployed Vercel URL