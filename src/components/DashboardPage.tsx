import React, { useEffect, useState } from 'react';
import { Card, CardContent, Button, Progress } from './ui';
import { motion } from 'motion/react';
import { supabase } from '../services/supabaseClient';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  ChevronRight, 
  Calendar,
  Clock,
  Plus,
  MessageSquare,
  Send,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { askDiagnosis } from '../services/tcmData';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDiagnosis: 0,
    activePatients: 0,
    aiAccuracy: 89
  });
  const [recentDiagnoses, setRecentDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello Doctor! I am your TCM Assistant. Ask me about symptoms or syndromes.' }
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    
    setTimeout(() => {
      const aiResponse = askDiagnosis(userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 500);
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { count: diagnosisCount } = await supabase
          .from('diagnoses')
          .select('*', { count: 'exact', head: true });

        const { count: patientCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        const { data: recent } = await supabase
          .from('diagnoses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setStats({
          totalDiagnosis: diagnosisCount || 0,
          activePatients: patientCount || 0,
          aiAccuracy: 89
        });
        setRecentDiagnoses(recent || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F1F1F]">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Doctor. Here's your clinical overview.</p>
        </div>
        <Link to="/diagnosis">
          <Button className="rounded-2xl h-14 px-8 text-lg font-semibold flex gap-2">
            <Plus size={20} /> New Diagnosis
          </Button>
        </Link>
        <Link to="/quick-diagnosis">
          <Button variant="outline" className="rounded-2xl h-14 px-8 text-lg font-semibold flex gap-2 border-amber-200 text-amber-600 hover:bg-amber-50">
            <Zap size={20} /> Quick Check
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-3xl border-none shadow-sm bg-white p-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Diagnosis</p>
                <h2 className="text-2xl font-bold">{stats.totalDiagnosis}</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-3xl border-none shadow-sm bg-white p-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-purple-50 text-purple-500 rounded-2xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Patients</p>
                <h2 className="text-2xl font-bold">{stats.activePatients}</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="rounded-3xl border-none shadow-sm bg-white p-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">AI Accuracy</p>
                <h2 className="text-2xl font-bold">{stats.aiAccuracy}%</h2>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT ACTIVITY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1F1F1F]">Recent Activity</h2>
            <Link to="/patients" className="text-[#6C5CE7] text-sm font-semibold flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentDiagnoses.length > 0 ? (
              recentDiagnoses.map((diagnosis, idx) => (
                <Card key={idx} className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#6C5CE7] font-bold">
                        {diagnosis.patient_name?.[0] || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{diagnosis.patient_name}</h3>
                        <p className="text-sm text-[#6C5CE7] font-medium">{diagnosis.syndrome}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar size={12} /> {new Date(diagnosis.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Clock size={12} /> {new Date(diagnosis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* QUICK INSIGHTS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1F1F1F]">System Insights</h2>
          <Card className="rounded-3xl border-none shadow-md bg-[#6C5CE7] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={120} />
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Performance</h3>
                <p className="text-white/80 text-sm">Our Maciocia-based engine is performing at peak efficiency. 89% of diagnoses match clinical outcomes.</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Processing Speed</span>
                  <span>98%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[98%]" />
                </div>
              </div>

              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl w-full">
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>

          {/* TCM ASSISTANT CHAT */}
          <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 bg-gray-50 border-b flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white">
                <MessageSquare size={16} />
              </div>
              <h3 className="font-bold text-gray-900">TCM Assistant</h3>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#6C5CE7] text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </CardContent>

            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <input 
                type="text"
                placeholder="Ask symptoms..."
                className="flex-1 bg-white border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#6C5CE7]/20"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                className="w-10 h-10 p-0 rounded-xl"
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
