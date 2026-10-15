import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Mic,
  MicOff,
  Volume2,
  Navigation,
  CheckCircle,
  ArrowRight,
  Languages,
  Sparkles,
} from 'lucide-react';

export const VoicePickingView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { orders, workers, skus } = state;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [language, setLanguage] = useState<'EN' | 'TE'>('EN');
  const [transcript, setTranscript] = useState<string>('');
  const [systemFeedback, setSystemFeedback] = useState<string>(
    'Voice guidance engine online. Say "Confirm Pick" or "Next Item".'
  );

  const activeWorker = workers['WRK-01'];
  const activeOrder = Object.values(orders).find((o) => o.status === 'ALLOCATED' || o.status === 'PICKING') || Object.values(orders)[0];
  const targetLine = activeOrder?.lines.find((l) => !l.isPicked) || activeOrder?.lines[0];
  const targetSku = targetLine ? skus[targetLine.skuId] : null;

  // Browser speech synthesis trigger
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = language === 'TE' ? 'te-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (cmd: string) => {
    setTranscript(cmd);

    if (cmd.includes('confirm') || cmd.includes('dhruveekarinchi') || cmd.includes('ధృవీకరించండి')) {
      if (activeOrder && targetLine) {
        actions.completePickLine(activeOrder.id, targetLine.id, activeWorker.id);
        const msg = language === 'TE'
          ? `ధృవీకరించబడింది! తదుపరి బిన్ A-04 కి వెళ్ళండి.`
          : `Item confirmed! Pick completed. Proceed to next location.`;
        setSystemFeedback(msg);
        speak(msg);
      }
    } else if (cmd.includes('repeat') || cmd.includes('malli') || cmd.includes('మళ్ళీ')) {
      const msg = language === 'TE'
        ? `బిన్ ${targetLine?.binLocationId} నుండి ${targetLine?.quantityAllocated} యూనిట్లు తీసుకోండి.`
        : `Pick ${targetLine?.quantityAllocated} units from Bin ${targetLine?.binLocationId}.`;
      setSystemFeedback(msg);
      speak(msg);
    } else {
      setSystemFeedback(`Command recognized: "${cmd}".`);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTranscript('Listening for picker speech...');
      setTimeout(() => {
        setIsListening(false);
        handleVoiceCommand(language === 'TE' ? 'ధృవీకరించండి (Confirm)' : 'Confirm Pick');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-xl p-4 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 glow-blue">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              AR HEADSET & HANDS-FREE VOICE PICKING ASSISTANT
            </h3>
            <p className="text-xs text-slate-300">
              Low-latency worker verbal guidance with dual English and Telugu (తెలుగు) operational vocabulary.
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-2 bg-[#0A0F1E] p-1 rounded-lg border border-white/5 text-xs font-mono">
          <Languages className="w-4 h-4 text-purple-400 ml-1" />
          <button
            onClick={() => setLanguage('EN')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              language === 'EN' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ENGLISH
          </button>
          <button
            onClick={() => setLanguage('TE')}
            className={`px-2.5 py-1 rounded font-bold transition-all ${
              language === 'TE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            తెలుగు (TELUGU)
          </button>
        </div>
      </div>

      {/* Main Guidance Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Worker AR HUD */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                ACTIVE WORKER GUIDANCE HUD
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                Picker: {activeWorker.name} ({activeWorker.id})
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-ping'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                }`}
                title="Toggle Voice Mic"
                aria-label="Toggle Voice Mic"
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => speak(systemFeedback)}
                className="p-3 rounded-full bg-[#111A2B] text-slate-300 hover:text-white border border-white/10"
                title="Read Out Instructions"
                aria-label="Read Out Instructions"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Pick Instruction Banner */}
          {targetLine && targetSku ? (
            <div className="bg-gradient-to-r from-purple-950/40 to-[#0A0F1E] rounded-2xl p-6 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                  NEXT TARGET LOCATION
                </span>
                <span className="text-2xl font-mono font-bold text-cyan-400">
                  BIN: {targetLine.binLocationId}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">{targetSku.name}</h3>
                <p className="text-xs font-mono text-slate-400">{targetSku.id} • Category: {targetSku.category}</p>
              </div>

              <div className="flex items-baseline space-x-3 bg-[#111A2B]/80 p-4 rounded-xl border border-white/5 font-mono">
                <span className="text-slate-400 text-xs uppercase">QUANTITY TO EXTRACT:</span>
                <span className="text-3xl font-bold text-emerald-400">{targetLine.quantityAllocated} UNITS</span>
                <span className="text-slate-500 text-xs ml-auto">Total Order: {activeOrder.id}</span>
              </div>

              {/* Multilingual Voice Feedback Display */}
              <div className="bg-[#0A0F1E] p-3 rounded-xl border border-white/10 text-xs font-mono space-y-1">
                <div className="text-slate-500 text-[10px]">VERBAL GUIDANCE PROMPT:</div>
                <div className="text-purple-300 font-medium">"{systemFeedback}"</div>
                {transcript && (
                  <div className="text-emerald-400 text-[11px] pt-1">Heard: "{transcript}"</div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              All currently assigned pick tasks completed. Worker idle in staging lane.
            </div>
          )}

          {/* Quick Voice Phrase Buttons */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              QUICK COMMANDS (CLICK OR SPEAK):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => handleVoiceCommand(language === 'TE' ? 'ధృవీకరించండి' : 'Confirm Pick')}
                className="p-2.5 rounded-lg bg-[#0A0F1E] border border-white/5 hover:border-purple-400 text-left text-purple-300 transition-all flex items-center justify-between"
              >
                <span>{language === 'TE' ? 'ధృవీకరించండి (Confirm Pick)' : 'Confirm Pick'}</span>
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </button>
              <button
                onClick={() => handleVoiceCommand(language === 'TE' ? 'మళ్ళీ చెప్పండి' : 'Repeat Instruction')}
                className="p-2.5 rounded-lg bg-[#0A0F1E] border border-white/5 hover:border-purple-400 text-left text-slate-300 transition-all flex items-center justify-between"
              >
                <span>{language === 'TE' ? 'మళ్ళీ చెప్పండి (Repeat)' : 'Repeat Instruction'}</span>
                <Volume2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Worker Stats & Accuracy */}
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white tracking-wider">
              PICK ROUTE TELEMETRY
            </h4>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">CURRENT COORDINATES</span>
              <span className="text-white font-bold">
                X: {activeWorker.x.toFixed(1)}m, Z: {activeWorker.z.toFixed(1)}m
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">PICK ACCURACY TODAY</span>
              <span className="text-emerald-400 font-bold">{activeWorker.accuracyRate}%</span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">COMPLETED PICKS</span>
              <span className="text-cyan-400 font-bold">{activeWorker.picksCompleted} units</span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">WALKING SPEED</span>
              <span className="text-purple-300 font-bold">{activeWorker.speedMps} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
