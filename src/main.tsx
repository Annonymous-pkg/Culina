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

  // Updated generate() to call serverless proxy /api/genai
  const generate = async () => {
    if (!videoUrl) return;
    setLoading(true);
    try {
      const res = await fetch('/api/genai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur serveur');

      const data = json.recipe || {};
      setRecipe({ ...data, id: Date.now().toString() });
      setVideoUrl('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      notify('Analyse terminée avec succès.');
    } catch (e: any) {
      console.error('Analyse error:', e);
      alert('Erreur d\'analyse : ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  const exportRecipe = () => {
    if (!recipe) {
      notify('Aucune recette à exporter.');
      return;
    }
    const dataStr = JSON.stringify(recipe, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Culina_Protocole_${recipe.title.replace(/\s+/g, '_')}.json`;
    link.click();
    notify('Fichier JSON exporté.');
  };

  const downloadSourceFiles = async () => {
    const files = ['index.html', 'index.tsx', 'manifest.json', 'package.json', 'metadata.json'];
    notify('Préparation du téléchargement...');
    
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
    notify('Fichiers sources téléchargés.');
  };

  const save = () => {
    if (!recipe) return;
    const next = [recipe, ...savedRecipes].slice(0, 20);
    setSavedRecipes(next);
    localStorage.setItem('culina_vision_v3', JSON.stringify(next));
    notify('Ajouté aux archives.');
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

      {recipe && !loading && (
        <section className="pt-28 md:pt-40 pb-40 px-6 max-w-7xl mx-auto ios-reveal">
          <div className="space-y-20 md:space-y-32">
            <div className="text-center space-y-6 md:space-y-10">
              <div className="inline-block px-4 py-1.5 rounded-full border border-[#C5A059]/20 text-[#C5A059] text-[8px] font-black tracking-[0.4em] uppercase">Protocole Certifié #{recipe.id?.slice(-4)}</div>
              <h2 className="text-palace text-4xl md:text-8xl lg:text-9xl italic font-black leading-tight tracking-tighter text-white break-words glow-beige px-4">{recipe.title}</h2>
              <div className="h-[0.5px] w-32 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent mx-auto"></div>
              <p className="max-w-3xl mx-auto text-lg md:text-2xl font-light text-[#F5F5DC]/40 italic leading-relaxed px-4">{recipe.description}</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 md:gap-24 items-start">
              <div className="lg:col-span-5 space-y-12 md:space-y-16 lg:sticky lg:top-32 px-4">
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black tracking-[0.5em] text-[#C5A059] uppercase">Matière Première</h3>
                  <div className="space-y-5">
                    {recipe.ingredients.map((ing, i) => (
                      <div key={i} className="flex flex-col border-b border-white/5 pb-5 group">
                        <div className="flex justify-between items-end mb-1 gap-3">
                          <span className="text-lg md:text-xl font-bold text-white/80 group-hover:text-white transition-all tracking-tight">{ing.item}</span>
                          <span className="text-base font-light text-[#C5A059]/60 shrink-0">{ing.qty}</span>
                        </div>
                        {ing.note && <span className="text-[10px] font-light text-[#F5F5DC]/30 italic uppercase tracking-widest">{ing.note}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {recipe.equipment && (
                  <div className="space-y-6 p-7 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <Utensils size={14} className="text-[#C5A059]" />
                      <h3 className="text-[9px] font-black tracking-[0.3em] text-[#C5A059] uppercase">Matériel Technique</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {recipe.equipment.map((item, i) => (
                        <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-medium text-white/40">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-16 md:space-y-24 px-4">
                <h3 className="text-[10px] font-black tracking-[0.5em] text-[#C5A059] uppercase">Protocole d'Exécution</h3>
                <div className="space-y-16 md:space-y-28">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="group flex gap-6 md:gap-12">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-6xl font-palace italic text-white/5 group-hover:text-[#C5A059]/30 transition-all duration-1000 leading-none">{i+1}</span>
                        <div className="w-[1px] h-full bg-gradient-to-b from-white/10 to-transparent mt-6 md:mt-10"></div>
                      </div>
                      <div className="pt-1.5 md:pt-3 space-y-3 md:space-y-5">
                        <span className="text-[8px] font-black tracking-[0.2em] text-[#C5A059]/40 uppercase group-hover:text-[#C5A059] transition-colors">{step.technique}</span>
                        <p className="text-lg md:text-2xl font-light text-[#F5F5DC]/60 group-hover:text-white transition-all duration-1000 leading-snug">{step.action}</p>
                        {step.duration && <div className="inline-flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full">⌛ {step.duration}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 glass-island px-6 md:px-10 py-4 md:py-5 rounded-full flex gap-8 md:gap-14 shadow-2xl items-center z-[200]">
              <button onClick={save} className="text-white/30 hover:text-[#C5A059] transition-all flex items-center gap-2.5 group">
                <Bookmark size={20} className="group-hover:fill-[#C5A059]/20" /> 
                <span className="hidden sm:block text-[9px] font-black tracking-[0.1em] uppercase">Archiver</span>
              </button>
              
              <button onClick={exportRecipe} className="text-white/30 hover:text-[#F5F5DC] transition-all flex items-center gap-2.5 group">
                <Download size={20} /> 
                <span className="hidden sm:block text-[9px] font-black tracking-[0.1em] uppercase">Exporter</span>
              </button>

              <div className="w-px h-6 bg-white/10"></div>

              <button onClick={() => setRecipe(null)} className="bg-[#F5F5DC] text-black w-10 h-10 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                <Plus size={22} className="rotate-45" />
              </button>
            </div>
          </div>
        </section>
      )}

      {showPremium && (
        <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 ios-reveal">
          <div className="glass-island p-10 md:p-14 rounded-[3rem] max-w-lg w-full text-center space-y-8 border border-[#C5A059]/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>
            <Crown size={64} className="text-[#C5A059] mx-auto animate-bounce drop-shadow-[0_0_20px_rgba(197,160,89,0.4)]" />
            <div className="space-y-4">
              <h2 className="text-palace text-4xl text-white italic">Statut Prestige</h2>
              <div className="h-px w-20 bg-[#C5A059]/20 mx-auto"></div>
              <p className="text-[#F5F5DC]/60 text-xs md:text-sm leading-relaxed uppercase tracking-[0.3em]">
                Accès privilégié à l'Oracle v4.0 activé. <br/>
                Propulsé par Google Gemini Pro pour la Maison Quentin Noel.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">Capacité IA</p>
                <p className="text-white text-xs font-bold">Illimitée</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <p className="text-[8px] font-black text-[#C5A059] uppercase tracking-widest">Priorité</p>
                <p className="text-white text-xs font-bold">Critique</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={downloadSourceFiles}
                className="w-full py-4 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-3 group"
              >
                <FileCode size={16} className="text-[#C5A059] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Télécharger le Projet (.zip)</span>
              </button>
              
              <button 
                onClick={() => setShowPremium(false)} 
                className="w-full py-5 bg-[#C5A059] text-black font-black uppercase tracking-[0.4em] rounded-2xl text-[10px] hover:scale-105 transition-all active:scale-95"
              >
                Retour à l'Oracle
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-[60px] flex items-center justify-center p-6 md:p-16 ios-reveal">
          <div className="w-full max-w-2xl space-y-12">
            <div className="flex justify-between items-center border-b border-white/10 pb-8">
              <span className="text-[10px] font-black tracking-[0.5em] text-[#C5A059] uppercase">Archives Vision</span>
              <button onClick={() => setShowHistory(false)} className="text-white/20 hover:text-white transition-all bg-white/5 p-3 rounded-full"><X size={24}/></button>
            </div>
            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-4 custom-scroll">
              {savedRecipes.length === 0 ? (
                <p className="text-center text-white/10 text-[9px] tracking-[1em] uppercase py-10 italic">Le Vault est vide</p>
              ) : (
                savedRecipes.map((r, i) => (
                  <div key={i} onClick={() => {setRecipe(r); setShowHistory(false);}} className="group flex justify-between items-center cursor-pointer border-b border-white/5 pb-6 hover:border-[#C5A059]/40 transition-all">
                    <span className="text-xl md:text-4xl font-palace italic text-white/30 group-hover:text-white transition-all">{r.title}</span>
                    <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-all text-[#C5A059]" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[1000] bg-black/95 flex flex-col items-center justify-center space-y-12 p-10">
           <div className="w-24 h-24 relative">
             <div className="absolute inset-0 border-[0.5px] border-[#C5A059]/20 rounded-full scale-150"></div>
             <div className="absolute inset-0 border-t-2 border-[#C5A059] rounded-full animate-spin"></div>
             <ChefHat size={40} className="text-[#C5A059] absolute inset-0 m-auto animate-pulse" />
           </div>
           <div className="text-center space-y-4">
             <p className="text-[11px] font-black tracking-[0.8em] text-[#C5A059] uppercase animate-pulse">Décodage Moléculaire</p>
             <p className="text-[8px] font-bold tracking-[0.3em] text-white/20 uppercase max-w-[250px] mx-auto leading-loose">Analyse IA des matières premières et du matériel technique en cours...</p>
           </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
