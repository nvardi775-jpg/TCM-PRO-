import React, { useState } from 'react';
import { Card, CardContent, Button, Progress, Input } from './ui';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { GoogleGenAI } from "@google/genai";
import { 
  Stethoscope, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCcw,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { getGeminiApiKey } from '../services/aiConfig';
import { diagnoseFromSymptoms, analyzeTongue } from '../services/tcmData';

const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });

export default function DiagnosisPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosisData, setDiagnosisData] = useState({
    patientName: '',
    symptoms: '',
    tongue: '',
    pulse: ''
  });
  const [result, setResult] = useState<any>(null);
  const [tongueAnalysis, setTongueAnalysis] = useState<any>(null);

  const handleQuickCheck = () => {
    if (!diagnosisData.symptoms) {
      setError('Please provide symptoms for quick check');
      return;
    }
    const quickResult = diagnoseFromSymptoms(diagnosisData.symptoms);
    if (quickResult) {
      setResult({
        syndrome: quickResult.name,
        confidence: 75,
        pathogenesis: `Quick diagnosis based on symptoms: ${diagnosisData.symptoms}. This matches the pattern for ${quickResult.name}.`,
        differential: [],
        points: quickResult.points,
        technique: quickResult.technique,
        rationale: "Selected based on symptom matching from the TCM Syndrome Master database."
      });
      setStep(3);
    } else {
      setError('No matching syndrome found in quick database. Please use Smart AI Analysis.');
    }
  };

  const handleTongueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const analysis = analyzeTongue(e.target.files[0]);
      setTongueAnalysis(analysis);
      setDiagnosisData(prev => ({ ...prev, tongue: `${prev.tongue} (AI Analysis: ${analysis.result}, Color: ${analysis.color})`.trim() }));
    }
  };

  const handleAnalyze = async () => {
    if (!diagnosisData.symptoms || !diagnosisData.patientName) {
      setError('Please provide patient name and symptoms');
      return;
    }

    setLoading(true);
    setError(null);
    setStep(2);

    try {
      const prompt = `Lakukan analisis Smart Diagnosis TCM berdasarkan kerangka klinis Giovanni Maciocia untuk data berikut:
Pasien: ${diagnosisData.patientName}
Gejala Utama (Diketikan oleh User): ${diagnosisData.symptoms}
Observasi Lidah (Diketikan oleh User): ${diagnosisData.tongue || 'Tidak disebutkan'}
Observasi Nadi (Diketikan oleh User): ${diagnosisData.pulse || 'Tidak disebutkan'}

Tugas Anda:
1. Analisis secara mendalam hubungan antara gejala, lidah, dan nadi yang diketikkan di atas.
2. Tentukan Sindrom Utama (Pattern) yang paling sesuai menurut Maciocia.
3. Berikan skor kepercayaan (0-100%) berdasarkan kecocokan data input dengan kriteria sindrom.
4. Jelaskan Patogenesis (mekanisme penyakit) secara detail.
5. Berikan diagnosis banding (differential diagnosis) dengan sindrom lain yang mirip.
6. Rekomendasikan titik akupunktur, teknik manipulasi, dan rasionalnya.

Berikan respon dalam format JSON murni (tanpa markdown) dengan struktur:
{
  "syndrome": "Nama Sindrom Utama",
  "confidence": 85,
  "pathogenesis": "Penjelasan mendalam tentang patogenesis sindrom ini berdasarkan input user",
  "differential": [
    { "name": "Sindrom Alternatif 1", "confidence": 65 },
    { "name": "Sindrom Alternatif 2", "confidence": 40 }
  ],
  "points": ["ST36", "SP6", "BL20"],
  "technique": "Penjelasan teknik manipulasi (misal: Tonifikasi + Moxa)",
  "rationale": "Alasan pemilihan titik-titik tersebut berdasarkan gejala spesifik pasien"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsedResult = JSON.parse(cleanJson);
      setResult(parsedResult);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('diagnoses')
        .insert([{
          patient_name: diagnosisData.patientName,
          symptoms: diagnosisData.symptoms,
          tongue: diagnosisData.tongue,
          pulse: diagnosisData.pulse,
          syndrome: parsedResult.syndrome,
          confidence: parsedResult.confidence,
          result_data: parsedResult,
          created_at: new Date().toISOString()
        }]);

      if (dbError) console.error('Error saving to Supabase:', dbError);

      setStep(3);
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      setError('AI Analysis failed. Please try again.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(108, 92, 231);
    doc.text("TCM MASTER CLINICAL REPORT", 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Patient: ${diagnosisData.patientName}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 35);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Main Syndrome:", 20, 55);
    doc.setFontSize(18);
    doc.setTextColor(108, 92, 231);
    doc.text(result.syndrome, 20, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Confidence: ${result.confidence}%`, 20, 75);
    
    doc.setFontSize(14);
    doc.text("Pathogenesis:", 20, 90);
    doc.setFontSize(10);
    const pathLines = doc.splitTextToSize(result.pathogenesis, 170);
    doc.text(pathLines, 20, 100);
    
    doc.setFontSize(14);
    doc.text("Recommended Points:", 20, 130);
    doc.setFontSize(12);
    doc.text(result.points.join(", "), 20, 140);
    
    doc.setFontSize(14);
    doc.text("Technique:", 20, 155);
    doc.setFontSize(10);
    doc.text(result.technique, 20, 165);
    
    doc.setFontSize(14);
    doc.text("Rationale:", 20, 180);
    doc.setFontSize(10);
    const rationaleLines = doc.splitTextToSize(result.rationale, 170);
    doc.text(rationaleLines, 20, 190);
    
    doc.save(`TCM_Report_${diagnosisData.patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Stethoscope className="text-[#6C5CE7]" size={32} />
          Diagnosis System
        </h1>
        <p className="text-gray-500">Step-by-step AI Clinical Analysis based on Maciocia</p>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center gap-4 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === s ? 'bg-[#6C5CE7] text-white scale-110 shadow-lg' : 
                step > s ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className={`text-xs font-medium ${step === s ? 'text-[#6C5CE7]' : 'text-gray-400'}`}>
                {s === 1 ? 'Input' : s === 2 ? 'Analysis' : 'Result'}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: INPUT */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Patient Name</label>
                    <Input 
                      placeholder="Enter patient name" 
                      value={diagnosisData.patientName}
                      onChange={(e) => setDiagnosisData({...diagnosisData, patientName: e.target.value})}
                      className="rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Symptoms</label>
                    <Input 
                      placeholder="e.g. fatigue, bloating, poor appetite" 
                      value={diagnosisData.symptoms}
                      onChange={(e) => setDiagnosisData({...diagnosisData, symptoms: e.target.value})}
                      className="rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tongue Observation</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. pale, swollen, thin white coat" 
                        value={diagnosisData.tongue}
                        onChange={(e) => setDiagnosisData({...diagnosisData, tongue: e.target.value})}
                        className="rounded-2xl h-12 flex-1"
                      />
                      <div className="relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          accept="image/*"
                          onChange={handleTongueUpload}
                        />
                        <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl">
                          <Share2 size={18} />
                        </Button>
                      </div>
                    </div>
                    {tongueAnalysis && (
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={10} /> AI Analysis: {tongueAnalysis.result} ({tongueAnalysis.color})
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Pulse Observation</label>
                    <Input 
                      placeholder="e.g. weak, slippery, deep" 
                      value={diagnosisData.pulse}
                      onChange={(e) => setDiagnosisData({...diagnosisData, pulse: e.target.value})}
                      className="rounded-2xl h-12"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-4 rounded-2xl">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl text-lg font-bold flex gap-2 border-gray-200"
                    onClick={handleQuickCheck}
                  >
                    Quick Check
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl text-lg font-bold flex gap-2"
                    onClick={handleAnalyze}
                  >
                    Start AI Analysis <ArrowRight size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: ANALYSIS */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center"
          >
            <Card className="rounded-3xl border-none shadow-xl p-12 space-y-8">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="text-[#6C5CE7] animate-pulse" size={48} />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Analyzing Syndrome...</h2>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Our AI is processing symptoms against Maciocia's clinical frameworks.
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-[#6C5CE7] rounded-full animate-bounce" />
              </div>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: RESULT */}
        {step === 3 && result && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
              <div className="bg-[#6C5CE7] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Primary Syndrome</p>
                  <h2 className="text-3xl font-bold">{result.syndrome}</h2>
                </div>
                <div className="flex items-center gap-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/20"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 - (213.6 * result.confidence) / 100}
                        strokeLinecap="round"
                        className="text-white transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                      {result.confidence}%
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Confidence Score</p>
                    <p className="text-sm font-bold">High Accuracy</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <FileText className="text-[#6C5CE7]" size={20} /> Pathogenesis
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{result.pathogenesis}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3">Differential Diagnosis</h3>
                      <div className="space-y-3">
                        {result.differential.map((diff: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                              <span>{diff.name}</span>
                              <span className="text-gray-400">{diff.confidence}%</span>
                            </div>
                            <Progress value={diff.confidence} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <RefreshCcw className="text-[#6C5CE7]" size={20} /> Treatment Plan
                      </h3>
                      
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Acupuncture Points</p>
                        <div className="flex flex-wrap gap-2">
                          {result.points.map((p: string) => (
                            <span key={p} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-[#6C5CE7] shadow-sm">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Technique</p>
                        <p className="text-sm font-medium">{result.technique}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Rationale</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{result.rationale}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
                  <Button className="flex-1 h-14 rounded-2xl gap-2" onClick={exportPdf}>
                    <Download size={20} /> Export PDF Report
                  </Button>
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl gap-2">
                    <Share2 size={20} /> Share with Patient
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="h-14 rounded-2xl px-8"
                    onClick={() => {
                      setStep(1);
                      setDiagnosisData({ patientName: '', symptoms: '', tongue: '', pulse: '' });
                      setResult(null);
                    }}
                  >
                    New Diagnosis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
