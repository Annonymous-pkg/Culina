import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { videoUrl } = req.body || {};
  if (!videoUrl) return res.status(400).json({ error: 'Missing videoUrl in request body' });

  const apiKey = process.env.GENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GENAI_API_KEY not configured in environment' });

  try {
    const mod = await import('@google/genai');
    const GoogleGenAI = (mod && (mod.GoogleGenAI || mod.default?.GoogleGenAI || mod.default)) || null;
    if (!GoogleGenAI) throw new Error('Unable to load @google/genai library');

    const client = new GoogleGenAI({ apiKey });

    const prompt = `
RÔLE : Ingénieur Culinaire de Palace.
TÂCHE : Analyse cette vidéo : ${videoUrl}
OBJECTIF : Précision chirurgicale.
INSTRUCTIONS :
1. Identifie chaque aliment visible.
2. Liste le MATÉRIEL TECHNIQUE nécessaire.
3. Quantifie précisément les ingrédients.
4. Découpe le protocole en étapes avec des noms de techniques clairs.

FORMAT JSON REQUIS :
{
  "title": "Nom du plat",
  "description": "Pitch court et luxueux",
  "prepTime": "Temps estimé",
  "servings": "Nombre de personnes",
  "ingredients": [{"item": "nom", "qty": "quantité", "note": "précision"}],
  "equipment": ["Liste du matériel requis"],
  "steps": [{"action": "description précise", "duration": "temps", "technique": "nom de la technique"}],
  "visionAnalysis": "Secrets détectés et style du chef",
  "chefTips": ["Astuces de pro"]
}
`;

    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 3000 }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({ recipe: parsed });
  } catch (err: any) {
    console.error('GenAI proxy error:', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
