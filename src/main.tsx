import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChefHat, 
  History, 
  X, 
  Crown, 
  ArrowRight,
  Plus,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Bookmark,
  Download,
  Layers,
  Utensils,
  CheckCircle2,
  FileCode
} from 'lucide-react';

interface Recipe {
  id?: string;
  title: string;
  description: string;
  prepTime: string;
  servings: string;
  ingredients: { item: string; qty: string; note?: string }[];
  equipment: string[];
  steps: { action: string; duration?: string; technique: string }[];
  visionAnalysis: string;
  chefTips: string[];
}

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const v = localStorage.getItem('culina_vision_v3');
    if (v) setSavedRecipes(JSON.parse(v));
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const generate = async () => {
    if (!videoUrl) return;
    setLoading(true);
    try {
      let GoogleGenAI: any = null;
      try {
        const mod = await import('@google/genai');
        GoogleGenAI = mod?.GoogleGenAI ?? mod?.default?.GoogleGenAI ?? mod?.default ?? null;
      } catch (err) {
        console.warn('Impossible de charger @google/genai dans le navigateur', err);
      }

      if (!GoogleGenAI) {
        alert("La bibliothèque d'analyse IA n'est pas disponible dans le navigateur. Utilisez un backend ou configurez un endpoint serveur.");
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: (import.meta.env.VITE_API_KEY || '') });
      const prompt = `
        RÔLE : Ingénieur Culinaire de Palace.
        TÂCHE : Analyse cette vidéo : ${videoUrl}
        OBJECTIF : Précision chirurgicale pour Quentin Noel.
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

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 3000 }
        }
      });

      const data = JSON.parse(res.text || '{}');
      setRecipe({ ...data, id: Date.now().toString() });
      setVideoUrl('');
      window.scrollTo({top: 0, behavior: 'smooth'});
      notify("Analyse terminée avec succès.");
    } catch (e) {
      console.error(e);
      alert("Erreur d'analyse. Lien invalide, clé API manquante ou endpoint inaccessible.");
    } finally {
      setLoading(false);
    }
  };

  const exportRecipe = () => {
    if (!recipe) {
      notify("Aucune recette à exporter.");
      return;
    }
    const dataStr = JSON.stringify(recipe, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Culina_Protocole_${recipe.title.replace(/\s+/g, '_')}.json`;
    link.click();
    notify("Fichier JSON exporté.");
  };

  const downloadSourceFiles = async () => {
    const files = ['index.html', 'index.tsx', 'manifest.json', 'package.json', 'metadata.json'];
    notify("Préparation du téléchargement...");
    
    for (const file of files) {
      try {
        const response = await fetch(`./${file}`);
        if (!response.ok) continue;
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.error(`Impossible de télécharger ${file}`, e);
      }
    }
    notify("Fichiers sources téléchargés.");
  };

  const save = () => {
    if (!recipe) return;
    const next = [recipe, ...savedRecipes].slice(0, 20);
    setSavedRecipes(next);
    localStorage.setItem('culina_vision_v3', JSON.stringify(next));
    notify("Ajouté aux archives.");
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5F5DC] marble-bg">
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[500] ios-reveal">
          <div className="bg-[#C5A059] text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">{notification}</span>
          </div>
        </div>
      )}
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] md:w-auto">
        <div className={`glass-island flex items-center justify-between md:justify-start px-5 md:px-8 py-3 md:py-4 rounded-full shadow-2xl transition-all duration-700 mx-auto ${loading ? 'w-full md:w-[400px]' : 'w-full md:w-auto'}`}>
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => {setRecipe(null); setShowPremium(false); setShowHistory(false);}}>
            <div className="w-8 h-8 rounded-full bg-[#F5F5DC]/10 flex items-center justify-center border border-white/5">
              <ChefHat size={16} className={`${loading ? 'text-[#C5A059] animate-spin' : 'text-[#C5A059]'}`} />
            </div>
            {!loading && <span className="hidden sm:block text-[9px] font-black tracking-[0.3em] text-white uppercase opacity-60">MAISON QUENTIN NOEL</span>}
          </div>
          
          {!loading && (
            <div className="flex items-center gap-4 md:gap-8 ml-3 md:ml-8 pl-3 md:pl-8 border-l border-white/10">
              <button onClick={() => setShowHistory(true)} className="text-white/30 hover:text-[#F5F5DC] transition-all p-1" title="Historique">
                <History size={18}/>
              </button>
              <button onClick={downloadSourceFiles} className="text-white/30 hover:text-[#C5A059] transition-all p-1" title="Télécharger le Code Source">
                <FileCode size={18}/>
              </button>
              <button onClick={() => setShowPremium(true)} className="text-[#C5A059] hover:scale-110 transition-transform p-1" title="Statut Premium">
                <Crown size={18} className="drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
              </button>
            </div>
          )}
          {loading && <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5A059] animate-pulse ml-auto uppercase italic truncate">Analyse en cours...</span>}
        </div>
      </nav>

      {/* Hero and rest of UI (unchanged) */}
      {!recipe && !loading && (
        <section className="pt-32 md:pt-56 pb-20 px-6 max-w-7xl mx-auto ios-reveal">
          <div className="text-center space-y-10 md:space-y-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl">
              <Layers size={12} className="text-[#C5A059]" />
              <span className="text-[9px] font-black tracking-[0.3em] text-[#C5A059] uppercase">Oracle Vision Pro v4.0</span>
            </div>
            
            <h1 className="text-palace text-5xl md:text-8xl lg:text-[10rem] leading-[1.1] md:leading-[0.85] font-black tracking-tighter text-white">
              Précision <br/><span className="italic text-[#F5F5DC]/80">Chirurgicale.</span>
            </h1>

            <div className="max-w-xl mx-auto relative mt-10 md:mt-24">
              <input 
                type="text"
                placeholder="LIEN VIDÉO DU CHEF"
                className="premium-input w-full px-8 md:px-12 py-7 md:py-10 rounded-[1.5rem] md:rounded-[2rem] text-center text-xs md:text-sm font-bold tracking-[0.2em] outline-none text-white uppercase placeholder:opacity-20"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generate()}
              />
              <button onClick={generate} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-[#F5F5DC] text-black rounded-xl md:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl group">
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-10 max-w-5xl mx-auto pt-20">
              {[
                { icon: <Zap/>, title: "Extraction IA", desc: "Décodage immédiat des ratios et des techniques invisibles." },
                { icon: <FileCode/>, title: "Export Projet", desc: "Téléchargez les fichiers index directement depuis l'interface." },
                { icon: <ShieldCheck/>, title: "Certifié Palace", desc: "Fiches techniques conformes aux brigades étoilées." }
              ].map((item, i) => (
                <div key={i} className="text-left p-8 glass-island rounded-[2rem] border-t border-white/10 space-y-4 hover:translate-y-[-5px] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">{item.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs md:text-sm font-light text-[#F5F5DC]/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Remainder of file unchanged; using same UI as original index.tsx */}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
