import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Key, Plus, Trash2, XCircle, ListOrdered, Search, LogIn, ShieldCheck, Save, FileText, ExternalLink } from 'lucide-react';
import { AppMode, ApiProvider } from '../types';
import { PUTER_MODELS } from '../constants';

interface Props {
  apiKeys: string[];
  setApiKeys: (keys: string[]) => void;
  isProcessing: boolean;
  mode?: AppMode | 'logs'; 
  
  provider?: ApiProvider | 'GOOGLE'; 
  setProvider?: (provider: ApiProvider | 'GOOGLE') => void;
  
  geminiModel?: string;
  setGeminiModel?: (m: string) => void;
  groqModel?: string;
  setGroqModel?: (m: string) => void;
  puterModel?: string;
  setPuterModel?: (m: string) => void;
  mistralBaseUrl?: string;
  setMistralBaseUrl?: (url: string) => void;
  mistralModel?: string;
  setMistralModel?: (m: string) => void;
  customBaseUrl?: string;
  setCustomBaseUrl?: (url: string) => void;
  customModel?: string;
  setCustomModel?: (model: string) => void;
  
  cooldownKeys?: Map<string, number>;

  workerCount?: number;
  setWorkerCount?: (count: number) => void;
}

const MISTRAL_PRESETS = [
  { value: 'pixtral-large-latest', label: 'Pixtral Large' },
  { value: 'pixtral-12b-2409', label: 'Pixtral 12B' },
  { value: 'mistral-large-latest', label: 'Mistral Large' }
];

const GROQ_PRESETS = [
  { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout' }
];

const GEMINI_PRESETS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }
];

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, 
  setApiKeys, 
  isProcessing, 
  // @ts-ignore
  provider = 'GOOGLE', 
  setProvider,
  geminiModel,
  setGeminiModel,
  puterModel,
  setPuterModel,
  groqModel,
  setGroqModel,
  mistralModel,
  setMistralModel,
  workerCount,
  setWorkerCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPuterAuthenticated, setIsPuterAuthenticated] = useState(false);
  const [isManualModel, setIsManualModel] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userModels, setUserModels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ISA_USER_MODELS');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  // STYLE REFORNAM
  const styles = {
    input: "w-full h-11 text-xs px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-['Share_Tech'] transition-all focus:outline-none focus:border-blue-500 disabled:bg-gray-50",
    label: "text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5 font-['Share_Tech']",
    btn3D: "border-2 border-b-[4px] transition-all active:border-b-2 active:translate-y-[2px] font-['Share_Tech'] font-bold uppercase",
  };

  useEffect(() => {
    const checkPuterAuth = async () => {
      const puter = (window as any).puter;
      if (puter) {
        const isSignedIn = await puter.auth.isSignedIn();
        setIsPuterAuthenticated(isSignedIn);
      }
    };
    checkPuterAuth();
    const interval = setInterval(checkPuterAuth, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('ISA_USER_MODELS', JSON.stringify(userModels));
  }, [userModels]);

  const getCurrentModel = () => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': return geminiModel;
        case 'MISTRAL': return mistralModel;
        case 'GROQ': return groqModel;
        case 'PUTER': return puterModel;
        default: return '';
    }
  };

  const setCurrentModel = (val: string) => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': setGeminiModel?.(val); break;
        case 'MISTRAL': setMistralModel?.(val); break;
        case 'GROQ': setGroqModel?.(val); break;
        case 'PUTER': setPuterModel?.(val); break;
    }
  };

  const currentModelName = getCurrentModel();
  const isCurrentModelCustom = userModels.includes((currentModelName || '').trim());

  const handleToggleCustomModel = () => {
    const name = (currentModelName || '').trim();
    if (!name) return;
    if (isCurrentModelCustom) {
      setUserModels(prev => prev.filter(m => m !== name));
    } else {
      setUserModels(prev => [...prev, name]);
    }
  };

  const handleGoogleLogin = () => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: 'PASTE_CLIENT_ID_ANDA_DISINI.apps.googleusercontent.com', 
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
        callback: (response: any) => {
          if (response.access_token) {
            setApiKeys([...apiKeys, response.access_token]);
          }
        },
      });
      client.requestAccessToken({ prompt: 'select_account' }); 
    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Script Google belum siap.");
    }
  };

  const handleAddKeys = () => {
    if (provider === 'PUTER') {
        if (!isPuterAuthenticated) return;
        setApiKeys([...apiKeys, `Slot_${apiKeys.length + 1}`]);
        return;
    }
    if (bulkInput.trim()) {
        const newKeys = bulkInput
            .split(/[\n,]+/)
            .map(k => k.trim())
            .filter(k => k.length > 0 && !apiKeys.includes(k));
        
        if (newKeys.length > 0) {
            setApiKeys([...apiKeys, ...newKeys]);
            setBulkInput('');
        }
    }
  };

  const handleDeleteOne = (keyToDelete: string) => setApiKeys(apiKeys.filter(k => k !== keyToDelete));
  const handleClearAll = () => setApiKeys([]);

  const handleWorkerChange = (value: string) => {
      if (!setWorkerCount) return;
      if (value === '') { setWorkerCount(0); return; }
      let num = parseInt(value);
      if (isNaN(num)) return;
      if (num > 10) num = 10;
      if (num < 0) num = 0;
      setWorkerCount(num);
  };

  const handlePuterLogin = async () => {
    const puter = (window as any).puter;
    if (!puter) return;
    try {
      await puter.auth.signIn();
      const isSignedIn = await puter.auth.isSignedIn();
      setIsPuterAuthenticated(isSignedIn);
    } catch (e) { console.error("Puter login failed", e); }
  };

  const handleLoadTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setBulkInput(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredKeys = useMemo(() => apiKeys.filter(k => k.toLowerCase().includes(searchTerm.toLowerCase())), [apiKeys, searchTerm]);
  
  const getBaseUrl = () => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': return "https://generativelanguage.googleapis.com";
        case 'MISTRAL': return "https://api.mistral.ai";
        case 'GROQ': return "https://api.groq.com/openai/v1/chat/completions";
        case 'PUTER': return "js.puter.com/v2/";
        default: return "";
    }
  };

  const getConnectLink = () => {
    switch(provider) {
        case 'GOOGLE': return "https://console.cloud.google.com/apis/credentials";
        case 'GEMINI': return "https://aistudio.google.com/app/api-keys";
        case 'MISTRAL': return "https://console.mistral.ai/api-keys";
        case 'GROQ': return "https://console.groq.com/keys";
        case 'PUTER': return "https://puter.com";
        default: return "#";
    }
  };

  const getModelPresets = () => {
    switch(provider) {
        case 'GOOGLE':
        case 'GEMINI': return GEMINI_PRESETS;
        case 'MISTRAL': return MISTRAL_PRESETS;
        case 'GROQ': return GROQ_PRESETS;
        case 'PUTER': return PUTER_MODELS.filter(m => m.group === 'MULTI');
        default: return [];
    }
  };

  const addActionLabel = (provider === 'PUTER' || provider === 'GOOGLE') ? 'Add Slot' : 'Add Key';

  return (
    <div className="bg-white p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-2 border-blue-200 flex flex-col font-['Share_Tech']">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-700 uppercase tracking-widest leading-none">API Settings</h2>
      </div>

      <div className="border-t-2 border-gray-100 mb-4"></div>
      
      <div className="flex flex-col gap-4">
        {/* ROW 1 */}
        <div className="grid grid-cols-2 gap-3">
           <div className="flex flex-col">
              <label className={styles.label}>Provider</label>
              <select className={styles.input} value={provider} onChange={(e) => setProvider?.(e.target.value as any)} disabled={isProcessing}>
                <option value="GOOGLE">Login Google (OAuth)</option>
                <option value="GEMINI">Google Gemini API</option>
                <option value="MISTRAL">Mistral AI</option>
                <option value="GROQ">Groq Cloud</option>
                <option value="PUTER">Puter.js</option>
              </select>
           </div>
           <div className="flex flex-col">
              <label className={styles.label}>Base URL</label>
              <input type="text" className={`${styles.input} bg-gray-50 text-gray-400`} value={getBaseUrl()} disabled />
           </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-2 gap-3">
           <div className="flex flex-col relative">
              <div className="flex items-center justify-between mb-0.5">
                  <label className={styles.label}>Model Name</label>
                  <button onClick={() => setIsManualModel(!isManualModel)} className="text-[10px] text-blue-500 underline font-bold">
                    {isManualModel ? 'LIST' : 'MANUAL'}
                  </button>
              </div>
              {isManualModel ? (
                  <div className="relative">
                    <input type="text" className={`${styles.input} pr-10`} placeholder="e.g. gpt-4o" value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing} />
                    <button onClick={handleToggleCustomModel} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isCurrentModelCustom ? 'text-red-500' : 'text-blue-500'}`}>
                      {isCurrentModelCustom ? <Trash2 size={16} /> : <Save size={16} />}
                    </button>
                  </div>
              ) : (
                  <select className={styles.input} value={currentModelName} onChange={(e) => setCurrentModel(e.target.value)} disabled={isProcessing}>
                      <optgroup label="System Models">
                        {getModelPresets().map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
                      </optgroup>
                      {userModels.length > 0 && (
                        <optgroup label="Custom Models">
                          {userModels.map(m => (<option key={m} value={m}>{m}</option>))}
                        </optgroup>
                      )}
                  </select>
              )}
           </div>

           <div className="flex flex-col">
              <label className={styles.label}>Workers</label>
              <div className="flex gap-2">
                  <input type="number" min="1" max="10" className={`${styles.input} text-center font-bold flex-1`} value={workerCount === 0 ? '' : workerCount} onChange={(e) => handleWorkerChange(e.target.value)} disabled={isProcessing} />
                  <button onClick={() => window.open(getConnectLink(), '_blank')} disabled={isProcessing || provider === 'GOOGLE'} className={`w-11 h-11 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border-blue-300 ${styles.btn3D}`}>
                      <ExternalLink size={18} />
                  </button>
              </div>
           </div>
        </div>

        <div className="border-t-2 border-gray-100"></div>

        {/* ROW DYNAMIC (AUTH AREA) */}
        <div className="h-[64px]">
          {provider === 'GOOGLE' ? (
              <button onClick={handleGoogleLogin} disabled={isProcessing} className={`w-full h-11 bg-white border-gray-300 text-gray-700 flex items-center justify-center gap-3 rounded-lg ${styles.btn3D}`}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4A90E2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/></svg>
                  <span>SIGN IN WITH GOOGLE</span>
              </button>
          ) : provider === 'PUTER' ? (
              <button onClick={handlePuterLogin} className={`w-full h-11 border-2 flex items-center justify-center gap-2 rounded-lg ${isPuterAuthenticated ? 'bg-green-50 border-green-500 text-green-700' : 'bg-blue-50 border-blue-500 text-blue-700'} ${styles.btn3D}`}>
                  {isPuterAuthenticated ? <ShieldCheck size={18}/> : <LogIn size={18}/>}
                  <span>{isPuterAuthenticated ? 'PUTER ACTIVE' : 'LOGIN PUTER'}</span>
              </button>
          ) : (
            <div className="flex gap-2 h-11">
                <textarea placeholder="Keys (one per line)..." className="flex-1 h-full px-3 py-2 text-[10px] font-mono border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 outline-none" value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
                <button onClick={() => fileInputRef.current?.click()} className={`w-11 h-11 bg-blue-50 border-blue-300 text-blue-600 flex flex-col items-center justify-center rounded-lg ${styles.btn3D}`}>
                    <FileText size={16} />
                    <span className="text-[7px] font-black">LOAD</span>
                    <input type="file" ref={fileInputRef} accept=".txt" className="hidden" onChange={handleLoadTxt} />
                </button>
            </div>
          )}
        </div>

        {/* SLOTS & ACTION BUTTONS */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-11 flex items-center justify-center gap-1 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-800 font-bold text-xs ${styles.btn3D.split('active')[0]}`}>
             SLOTS: {apiKeys.length}
          </div>
          <button onClick={handleAddKeys} disabled={isProcessing || provider === 'GOOGLE' || (provider === 'PUTER' && !isPuterAuthenticated) || (provider !== 'PUTER' && provider !== 'GOOGLE' && !bulkInput.trim())} className={`h-11 bg-blue-600 text-white border-blue-800 flex items-center justify-center gap-1 rounded-lg ${styles.btn3D}`}>
            <Plus size={16} /> <span className="text-xs">{addActionLabel}</span>
          </button>
          <button onClick={handleClearAll} disabled={apiKeys.length === 0} className={`h-11 bg-red-50 text-red-600 border-red-300 flex items-center justify-center gap-1 rounded-lg ${styles.btn3D}`}>
            <Trash2 size={16} /> <span className="text-xs">CLEAR</span>
          </button>
        </div>

        {/* LIST SECTION */}
        <div className="border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden flex flex-col h-[280px]">
          <div className="bg-gray-100 px-3 py-2 border-b-2 border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <ListOrdered size={14} className="text-gray-500" />
                  <span className="text-[11px] font-bold text-gray-600 uppercase">Worker Capacity Slots</span>
              </div>
              <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-24 pl-6 pr-2 py-0.5 text-[10px] border border-gray-300 rounded-full focus:outline-none" />
              </div>
          </div>
          <div className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300">
              {filteredKeys.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                      <ListOrdered size={24} className="mb-2" />
                      <span className="text-[10px] font-bold uppercase">Empty</span>
                  </div>
              ) : (
                  filteredKeys.map((k, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg mb-1 shadow-sm group">
                          <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-[10px] font-bold text-gray-500 rounded border border-gray-200">{idx + 1}</span>
                          <div className="flex-1 truncate font-mono text-[11px] text-gray-600">
                              {provider === 'PUTER' ? k : k.substring(0, 15) + '...' + k.substring(k.length - 8)}
                          </div>
                          <button onClick={() => handleDeleteOne(k)} className="text-gray-300 hover:text-red-500 transition-colors"><XCircle size={14} /></button>
                      </div>
                  ))
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
