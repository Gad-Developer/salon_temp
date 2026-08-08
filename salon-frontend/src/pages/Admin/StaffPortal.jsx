import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Unlock, KeyRound, Copy, CheckCircle2 } from 'lucide-react';

const StaffPortal = () => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const CORRECT_PIN = import.meta.env.VITE_STAFF_PIN || '778899'; // Fallback for testing

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid PIN. Access Denied.');
      setPin('');
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setError('');
    setCopied(false);
    
    try {
      const response = await axios.post('/api/reviews/generate-code');
      setGeneratedCode(response.data.code);
    } catch (err) {
      setError('Failed to generate code. Check server connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans text-white">
      <div className="max-w-md w-full bg-[#141414] p-8 rounded-2xl border border-[#2a2a2a] shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">
            STAFF <span className="text-[#d32f2f]">PORTAL</span>
          </h2>
          <p className="text-[#a3a3a3] text-sm">Authorized Personnel Only</p>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
            {error && <div className="bg-[#d32f2f]/10 border border-[#d32f2f]/50 text-[#d32f2f] p-3 rounded-lg text-sm text-center">{error}</div>}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#555]">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Staff PIN"
                className="w-full bg-[#0a0a0a] border border-[#333] text-white pl-12 pr-4 py-3.5 rounded-lg focus:outline-none focus:border-[#d32f2f] tracking-widest font-mono"
                required
              />
            </div>
            
            <button className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all">
              Access System
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/30">
                <Unlock size={20} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-6">Review Code Generator</h3>
            
            {error && <div className="bg-[#d32f2f]/10 border border-[#d32f2f]/50 text-[#d32f2f] p-3 rounded-lg text-sm mb-4">{error}</div>}

            {generatedCode ? (
              <div className="bg-[#0a0a0a] border border-[#333] rounded-xl p-6 relative group">
                <p className="text-[#a3a3a3] text-xs uppercase font-bold tracking-wider mb-2">Active Code (24h)</p>
                <p className="text-4xl font-black tracking-[0.2em] font-mono text-white mb-4">{generatedCode}</p>
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] hover:bg-[#333] border border-[#333] text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {copied ? <><CheckCircle2 size={16} className="text-green-500"/> Copied!</> : <><Copy size={16}/> Copy Code</>}
                </button>
              </div>
            ) : (
              <div className="bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl p-8 text-[#555]">
                <KeyRound size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-xs uppercase tracking-wider font-bold">No active code generated</p>
              </div>
            )}

            <button 
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]"
            >
              {isGenerating ? 'Generating...' : 'Generate New Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPortal;