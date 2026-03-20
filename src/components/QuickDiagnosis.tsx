import React, { useState } from 'react';
import { Card, CardContent, Button, Input } from './ui';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  Activity,
  ArrowRight,
  Info,
  ChevronLeft
} from 'lucide-react';
import { diagnoseFromSymptoms, acupuncturePoints } from '../services/tcmData';

export default function QuickDiagnosis() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = () => {
    setError(null);
    if (!symptoms.trim()) {
      setError('Please enter some symptoms first.');
      return;
    }

    const match = diagnoseFromSymptoms(symptoms);
    if (match) {
      setResult(match);
    } else {
      setError('No direct match found in the syndrome database. Try more specific symptoms or use the Smart AI Analysis.');
      setResult(null);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1F1F1F]">Quick Diagnosis</h1>
            <p className="text-gray-500">Instant syndrome matching from the TCM Master database.</p>
          </div>
        </div>
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 text-gray-500">
            <ChevronLeft size={20} /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* INPUT SECTION */}
      <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Activity size={18} className="text-[#6C5CE7]" />
              What are the patient's symptoms?
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C5CE7] transition-colors" size={20} />
              <Input 
                placeholder="e.g. fatigue, bloating, insomnia, palpitations..." 
                className="pl-12 h-16 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#6C5CE7]/20 text-lg"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDiagnose()}
              />
            </div>
            <p className="text-xs text-gray-400 italic">
              Tip: Enter multiple symptoms separated by commas for better matching.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-4 rounded-2xl border border-amber-100"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold bg-[#6C5CE7] hover:bg-[#5A4AD1] shadow-lg shadow-[#6C5CE7]/20 transition-all active:scale-[0.98]"
            onClick={handleDiagnose}
          >
            Run Quick Analysis
          </Button>
        </CardContent>
      </Card>

      {/* RESULT SECTION */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Main Syndrome Info */}
              <Card className="md:col-span-7 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                <div className="bg-[#6C5CE7] p-6 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">{result.category || 'Zang Fu'} Pattern</span>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">MATCH FOUND</div>
                  </div>
                  <h2 className="text-3xl font-bold mt-2">{result.name}</h2>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      Matched Symptoms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.symptoms.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-[#6C5CE7] flex items-center gap-2 mb-3">
                      <Target size={18} /> Treatment Strategy
                    </h3>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      The primary objective is <span className="text-[#6C5CE7] font-bold">{result.technique}</span>. 
                      Focus on regulating the flow of Qi and balancing the associated organ systems.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Acupuncture Points */}
              <Card className="md:col-span-5 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Zap size={20} className="text-amber-500" /> Recommended Points
                  </h3>
                </div>
                <CardContent className="p-6 space-y-4">
                  {result.points.map((pointId: string) => {
                    const pointInfo = acupuncturePoints[pointId];
                    return (
                      <div key={pointId} className="group p-4 bg-gray-50 hover:bg-[#6C5CE7]/5 rounded-2xl transition-all border border-transparent hover:border-[#6C5CE7]/20">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[#6C5CE7] text-lg">{pointId}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{pointInfo?.name || 'Point'}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{pointInfo?.function || 'General regulatory function.'}</p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Info size={10} /> {pointInfo?.location || 'See meridian map for location.'}
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-dashed border-gray-200 text-gray-500 hover:text-[#6C5CE7] hover:border-[#6C5CE7] mt-4"
                    onClick={() => window.location.href = '/meridian'}
                  >
                    View on Meridian Map <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
