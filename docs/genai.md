# GenAI proxy (Vercel) - Usage

This function proxies requests to the Google GenAI SDK using the environment variable GENAI_API_KEY.

Environment setup (Vercel):

1. Open your project in the Vercel dashboard.
2. Go to Settings → Environment Variables.
3. Add a new variable:
   - Key: GENAI_API_KEY
   - Value: <your Google GenAI API key>
   - Environment: Production (and Preview/Development as needed)
4. Redeploy your project so the environment variable is available to serverless functions.

You can also use the Vercel CLI:

  vercel env add GENAI_API_KEY production

Endpoint:

POST /api/genai

Request body (JSON):

{
  "videoUrl": "https://example.com/path/to/video.mp4"
}

Example curl:

curl -X POST "https://your-deployment.vercel.app/api/genai" \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"https://example.com/video.mp4"}'

Expected success response (200):

{
  "recipe": { /* parsed JSON structure returned by the GenAI model */ }
}

On error, the function returns:

{
  "error": "error message"
}

Notes:
- Ensure GENAI_API_KEY is set and has the appropriate permissions for the SDK you are using.
- The serverless function attempts to parse the model response as JSON; if the response is not valid JSON you'll get a 500 error.
- For local testing with Vercel CLI (vercel dev) set the environment variable in your shell: export GENAI_API_KEY="your_key_here" (or use .env integration).
