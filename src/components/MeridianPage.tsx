import React, { useState } from 'react';
import { Card, CardContent } from './ui';
import { motion } from 'motion/react';
import { 
  Info, 
  Map as MapIcon, 
  Activity, 
  Layers, 
  Target, 
  Search,
  ChevronRight
} from 'lucide-react';
import { acupuncturePoints } from '../services/tcmData';

interface Point {
  id: string;
  name: string;
  x: number;
  y: number;
  meridian: string;
  desc: string;
  location: string;
}

const points: Point[] = [
  { id: 'ST36', name: 'ST36 (Zusanli)', x: 145, y: 320, meridian: 'Stomach', desc: 'Tonify Qi & Blood', location: 'Below knee' },
  { id: 'SP6', name: 'SP6 (Sanyinjiao)', x: 155, y: 380, meridian: 'Spleen', desc: 'Tonify Yin', location: 'Above ankle' },
  { id: 'LV3', name: 'LV3 (Taichong)', x: 140, y: 430, meridian: 'Liver', desc: 'Regulate Liver Qi', location: 'Foot' },
  { id: 'LI4', name: 'LI4 (Hegu)', x: 100, y: 180, meridian: 'Large Intestine', desc: 'Pain relief', location: 'Hand' },
  { id: 'HT7', name: 'HT7 (Shenmen)', x: 200, y: 180, meridian: 'Heart', desc: 'Calm the Mind', location: 'Wrist' },
  { id: 'LU9', name: 'LU9 (Taiyuan)', x: 210, y: 170, meridian: 'Lung', desc: 'Tonify Lung Qi', location: 'Wrist' },
  { id: 'KI3', name: 'KI3 (Taixi)', x: 160, y: 410, meridian: 'Kidney', desc: 'Tonify Kidney', location: 'Ankle' },
];

const MERIDIANS = [
  { id: 'LU', name: 'Lung Meridian', points: 11, element: 'Metal', color: 'bg-gray-400' },
  { id: 'LI', name: 'Large Intestine', points: 20, element: 'Metal', color: 'bg-gray-500' },
  { id: 'ST', name: 'Stomach Meridian', points: 45, element: 'Earth', color: 'bg-yellow-500' },
  { id: 'SP', name: 'Spleen Meridian', points: 21, element: 'Earth', color: 'bg-yellow-600' },
  { id: 'HT', name: 'Heart Meridian', points: 9, element: 'Fire', color: 'bg-red-500' },
  { id: 'SI', name: 'Small Intestine', points: 19, element: 'Fire', color: 'bg-red-600' },
  { id: 'BL', name: 'Bladder Meridian', points: 67, element: 'Water', color: 'bg-blue-600' },
  { id: 'KI', name: 'Kidney Meridian', points: 27, element: 'Water', color: 'bg-blue-700' },
  { id: 'PC', name: 'Pericardium', points: 9, element: 'Fire', color: 'bg-red-400' },
  { id: 'TE', name: 'Triple Energizer', points: 23, element: 'Fire', color: 'bg-orange-500' },
  { id: 'GB', name: 'Gallbladder', points: 44, element: 'Wood', color: 'bg-green-600' },
  { id: 'LR', name: 'Liver Meridian', points: 14, element: 'Wood', color: 'bg-green-700' },
];

export default function MeridianPage() {
  const [activePoint, setActivePoint] = useState<Point | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeridian, setSelectedMeridian] = useState<any>(null);

  const filteredPoints = points.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.meridian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
            <MapIcon size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1F1F1F]">Meridian Visual PRO</h1>
            <p className="text-gray-500">Interactive TCM point mapping and meridian flows</p>
          </div>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C5CE7] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search points or meridians..."
            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-all w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Meridian List */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Channels</h2>
          <div className="grid grid-cols-1 gap-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {MERIDIANS.map((m) => (
              <Card 
                key={m.id} 
                className={`rounded-2xl border-none shadow-sm cursor-pointer transition-all hover:translate-x-1 ${
                  selectedMeridian?.id === m.id ? 'ring-2 ring-[#6C5CE7] bg-white' : 'bg-white'
                }`}
                onClick={() => setSelectedMeridian(m)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${m.color} text-white flex items-center justify-center font-bold`}>
                      {m.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <p className="text-xs text-gray-400">{m.points} Points · {m.element}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive SVG Body */}
        <Card className="lg:col-span-5 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
          <CardContent className="p-8 flex items-center justify-center min-h-[600px] relative">
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-full text-xs font-bold uppercase tracking-wider">
                <Activity size={14} /> Live Mapping
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Layers size={14} /> 12 Main Meridians
              </div>
            </div>

            <svg viewBox="0 0 300 500" className="w-full max-w-[400px] drop-shadow-2xl">
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8f9ff" />
                  <stop offset="100%" stopColor="#eef2ff" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Head */}
              <circle cx="150" cy="60" r="35" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />
              {/* Torso */}
              <path d="M115 95 Q150 85 185 95 L195 280 Q150 300 105 280 Z" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />
              {/* Arms */}
              <path d="M115 110 L60 220 Q50 230 65 235 L115 140" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />
              <path d="M185 110 L240 220 Q250 230 235 235 L185 140" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />
              {/* Legs */}
              <path d="M115 285 L100 460 Q100 475 125 475 L145 295" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />
              <path d="M185 285 L200 460 Q200 475 175 475 L155 295" fill="url(#bodyGradient)" stroke="#d1d5db" strokeWidth="1.5" />

              {/* MERIDIAN LINES */}
              {selectedMeridian && (
                <path
                  d="M150 100 Q160 200 150 400"
                  stroke={selectedMeridian.color.replace('bg-', '#').replace('500', '6C5CE7')}
                  strokeWidth="2.5"
                  strokeDasharray="6,6"
                  fill="none"
                  className="opacity-40 animate-pulse"
                />
              )}

              {/* POINTS */}
              {filteredPoints.map((p) => (
                <g 
                  key={p.id} 
                  className="cursor-pointer group"
                  onMouseEnter={() => setActivePoint(p)}
                  onClick={() => setActivePoint(p)}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activePoint?.id === p.id ? "10" : "6"}
                    fill={activePoint?.id === p.id ? "#6C5CE7" : "#fff"}
                    stroke="#6C5CE7"
                    strokeWidth="2.5"
                    className="transition-all duration-300 group-hover:r-10"
                    filter={activePoint?.id === p.id ? "url(#glow)" : ""}
                  />
                  {activePoint?.id === p.id && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="none"
                      stroke="#6C5CE7"
                      strokeWidth="1"
                      className="animate-ping opacity-30"
                    />
                  )}
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
            <div className="bg-[#6C5CE7] p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target size={20} /> Point Intelligence
              </h2>
            </div>
            <CardContent className="p-8">
              {activePoint ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <p className="text-xs font-bold text-[#6C5CE7] uppercase tracking-widest mb-1">{activePoint.meridian} Meridian</p>
                    <h3 className="text-3xl font-bold text-gray-900">{activePoint.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Function</p>
                      <p className="text-sm font-semibold text-gray-700">{activePoint.desc}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 uppercase font-bold mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-700">{activePoint.location}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#6C5CE7]/5 rounded-2xl border border-[#6C5CE7]/10">
                    <h4 className="text-sm font-bold text-[#6C5CE7] flex items-center gap-2 mb-3">
                      <Info size={16} /> Clinical Application
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {acupuncturePoints[activePoint.id]?.function || "General regulatory function for the associated meridian system."}
                    </p>
                    <p className="text-xs text-gray-400 mt-4 italic">
                      {acupuncturePoints[activePoint.id]?.location || ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <MapIcon size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Point Selected</h3>
                  <p className="text-gray-500 text-sm max-w-[200px] mt-2">
                    Hover or click a point on the body map to see clinical details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
