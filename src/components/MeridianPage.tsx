import React, { useState } from 'react';
import { Card, CardContent, Button } from './ui';
import { motion } from 'motion/react';
import { 
  Map as MapIcon, 
  Info, 
  Search,
  ChevronRight,
  Activity
} from 'lucide-react';

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
  const [selectedMeridian, setSelectedMeridian] = useState<any>(null);

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
          <MapIcon size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F]">Meridian Map</h1>
          <p className="text-gray-500">Visual guide to TCM energy channels and points.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MERIDIAN LIST */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Channels</h2>
          <div className="grid grid-cols-1 gap-3">
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

        {/* VISUALIZER */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">Visualizer</h2>
          <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden min-h-[600px] flex flex-col">
            {selectedMeridian ? (
              <div className="flex-1 flex flex-col">
                <div className={`p-8 ${selectedMeridian.color} text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-bold mb-1">{selectedMeridian.name}</h3>
                      <p className="opacity-80 font-medium">{selectedMeridian.element} Element Channel</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold">
                      {selectedMeridian.id}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8 flex-1 flex flex-col items-center justify-center space-y-8">
                  {/* Placeholder for actual SVG/Canvas human body map */}
                  <div className="relative w-full max-w-md aspect-[3/4] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                      <MapIcon size={300} />
                    </div>
                    <div className="text-center space-y-4 relative z-10 p-6">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-[#6C5CE7]">
                        <Activity size={32} />
                      </div>
                      <h4 className="font-bold text-gray-900">Interactive Map for {selectedMeridian.id}</h4>
                      <p className="text-sm text-gray-500">
                        Visualizing the flow of Qi through the {selectedMeridian.name}. 
                        This channel contains {selectedMeridian.points} primary acupuncture points.
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-3 h-3 rounded-full ${selectedMeridian.color} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Common Uses</p>
                      <p className="text-sm text-gray-700">Treating {selectedMeridian.id} related imbalances, pain along the channel, and organ-specific symptoms.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Peak Time</p>
                      <p className="text-sm text-gray-700">Optimal treatment time: {selectedMeridian.id === 'LU' ? '3am - 5am' : 'Varies by channel'}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            ) : (
              <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mb-4">
                  <MapIcon size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Select a Channel</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Choose a meridian from the list to view its visual path, key points, and clinical significance.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
