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
  mistralModel?: string;
  setMistralModel?: (m: string) => void;
  workerCount?: number;
  setWorkerCount?: (count: number) => void;
}

const ApiKeyPanel: React.FC<Props> = ({ 
  apiKeys, setApiKeys, isProcessing, 
  // @ts-ignore
  provider = 'GOOGLE', 
  setProvider, geminiModel, setGeminiModel, puterModel, setPuterModel, 
  groqModel, setGroqModel, mistralModel, setMistralModel, workerCount, setWorkerCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPuterAuthenticated, setIsPuterAuthenticated] = useState(false);
  const [isManualModel, setIsManualModel] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Gaya Desain REFORNAM (Neo-Brutalism)
  const styles = {
    input: "h-[36px] text-[13px] px-3 border-2 border-gray-300 rounded-lg bg-white font-['Share_Tech'] focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50",
    btnMain: "h-[38px] flex items-center justify-center border-none font-['Share_Tech'] font-bold uppercase tracking-wider rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] transition-all disabled:opacity-30 disabled:shadow-none disabled:translate-y-0",
    btnSquare: "w-[38px] h-[38px] flex items-center justify-center rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] transition-all disabled:opacity-30",
    label: "text-[13px] font-bold text-blue-600 font-['Share_Tech'] uppercase mb-1"
  };

  const handleGoogleLogin = () => {
    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: 'PASTE_CLIENT_ID_ANDA_DISINI.apps.googleusercontent.com', 
        scope: 'https://www.googleapis.com/auth/generative-language.retriever',
        callback: (response: any) => {
          if (response.access_token) setApiKeys([...apiKeys, response.access_token]);
        },
      });
      client.requestAccessToken({ prompt: 'select_account' }); 
    } catch (error) { alert("Google Script Error"); }
  };

  const handleAddKeys = () => {
    if (provider === 'PUTER' && isPuterAuthenticated) {
      setApiKeys([...apiKeys, `Slot_${apiKeys.length + 1}`]);
    } else if (bulkInput.trim()) {
      const newKeys = bulkInput.split(/[\n,]+/).map(k => k.trim()).filter(k => k && !apiKeys.includes(k));
      setApiKeys([...apiKeys, ...newKeys]);
      setBulkInput('');
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

  const addActionLabel = (provider === 'PUTER' || provider === 'GOOGLE') ? 'Add Slot' : 'Add Key';

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col font-['Share_Tech']">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-blue-600 pb-2 w-fit">
        <Key className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-600 uppercase tracking-widest">API Settings</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label className={styles.label}>Provider</label>
          <select className={styles.input} value={provider} onChange={(e) => setProvider?.(e.target.value as any)}>
            <option value="GOOGLE">Login Google (OAuth)</option>
            <option value="GEMINI">Google Gemini API</option>
            <option value="MISTRAL">Mistral AI</option>
            <option value="GROQ">Groq Cloud</option>
            <option value="PUTER">Puter.js</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className={styles.label}>Base URL</label>
          <div className="h-[36px] bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center px-3 text-[12px] text-gray-500 overflow-hidden truncate">
            {provider === 'GOOGLE' ? "OAuth 2.0 Identity" : "api.external.server/v1"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <label className={styles.label}>Model Name</label>
            <button onClick={() => setIsManualModel(!isManualModel)} className="text-[11px] underline text-blue-500">
              {isManualModel ? 'LIST' : 'MANUAL'}
            </button>
          </div>
          <input type="text" className={styles.input} placeholder="Auto-Detecting..." disabled={!isManualModel} />
        </div>
        <div className="flex flex-col">
          <label className={styles.label}>Workers</label>
          <div className="flex gap-2">
            <input type="number" className={`${styles.input} flex-1 text-center font-bold`} value={workerCount} onChange={(e) => setWorkerCount?.(parseInt(e.target.value))} />
            <button onClick={() => window.open(getConnectLink(), '_blank')} disabled={provider === 'GOOGLE'} className={`${styles.btnSquare} bg-blue-50 text-blue-600 border-2 border-blue-200`}>
              <ExternalLink size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ANTI LAYOUT SHIFT CONTAINER (h-14) */}
      <div className="h-[60px] mb-4">
          {provider === 'GOOGLE' ? (
            <button onClick={handleGoogleLogin} className={`${styles.btnMain} w-full bg-white border-2 border-gray-300 text-gray-700 gap-3`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#4A90E2" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/></svg>
                SIGN IN WITH GOOGLE
            </button>
          ) : (
            <div className="flex gap-2 h-full">
              <textarea placeholder="Keys (one per line)..." className={`${styles.input} flex-1 h-full py-2 resize-none font-mono text-[10px]`} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} />
              <button onClick={() => fileInputRef.current?.click()} className={`${styles.btnSquare} bg-green-50 text-green-700 border-2 border-green-200`}>
                <FileText size={18} />
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleLoadTxt} />
              </button>
            </div>
          )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="flex items-center justify-center h-[38px] rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-800 font-bold text-sm">
          SLOTS: {apiKeys.length}
        </div>
        <button onClick={handleAddKeys} disabled={provider === 'GOOGLE'} className={`${styles.btnMain} bg-blue-600 text-white`}>
          <Plus size={18} className="mr-1" /> {addActionLabel}
        </button>
        <button onClick={handleClearAll} className={`${styles.btnMain} bg-red-500 text-white`}>
          <Trash2 size={18} className="mr-1" /> CLEAR ALL
        </button>
      </div>

      <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden flex flex-col h-[250px]">
        <div className="bg-gray-200 px-3 py-2 border-b-2 border-gray-300 flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-600 tracking-tighter">WORKER CAPACITY SLOTS</span>
            <Search size={14} className="text-gray-400" />
        </div>
        <div className="p-2 overflow-y-auto flex-1">
          {apiKeys.map((k, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-white border-2 border-gray-100 rounded-lg mb-2 shadow-sm">
              <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] rounded-full font-bold">{idx + 1}</span>
              <div className="flex-1 truncate font-mono text-[11px] text-gray-600">{k.substring(0, 15)}...</div>
              <button onClick={() => setApiKeys(apiKeys.filter(key => key !== k))} className="text-gray-300 hover:text-red-500"><XCircle size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPanel;
