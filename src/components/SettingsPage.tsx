import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input } from './ui';
import { Settings, Shield, Database, User, Save, RotateCcw, Brain, Lock, Unlock, Key, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { updateSupabaseConfig, resetSupabaseConfig } from '../services/supabaseClient';
import { getGeminiApiKey, updateGeminiApiKey, resetGeminiApiKey, getSuperAdminPassword, setSuperAdminPassword, checkSuperAdminPassword } from '../services/aiConfig';
import { getAllProfiles, updateUserProfile, UserProfile } from '../services/userService';

export default function SettingsPage() {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [isGeminiExternal, setIsGeminiExternal] = useState(false);
  
  // User Management State
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Super Admin Password State
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isLocked, setIsLocked] = useState(!!getSuperAdminPassword());
  const [unlockPassword, setUnlockPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem('SUPABASE_EXTERNAL_URL');
    const storedKey = localStorage.getItem('SUPABASE_EXTERNAL_KEY');
    const storedGeminiKey = localStorage.getItem('GEMINI_EXTERNAL_KEY');
    
    if (storedUrl || storedKey) {
      setUrl(storedUrl || '');
      setKey(storedKey || '');
      setIsExternal(true);
    } else {
      setUrl(import.meta.env.VITE_SUPABASE_URL || '');
      setKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
      setIsExternal(false);
    }

    if (storedGeminiKey) {
      setGeminiKey(storedGeminiKey);
      setIsGeminiExternal(true);
    } else {
      setGeminiKey(process.env.GEMINI_API_KEY || '');
      setIsGeminiExternal(false);
    }
  }, []);

  const handleSaveSupabase = () => {
    if (!url || !key) {
      alert('Supabase URL and Key are required');
      return;
    }
    updateSupabaseConfig(url, key);
  };

  const handleSaveGemini = () => {
    if (!geminiKey) {
      alert('Gemini API Key is required');
      return;
    }
    updateGeminiApiKey(geminiKey);
  };

  const handleResetSupabase = () => {
    if (confirm('Reset Supabase to platform default settings? This will reload the page.')) {
      resetSupabaseConfig();
    }
  };

  const handleResetGemini = () => {
    if (confirm('Reset Gemini API Key to platform default? This will reload the page.')) {
      resetGeminiApiKey();
    }
  };

  const handleSetAdminPassword = () => {
    if (!newAdminPassword) {
      alert('Password cannot be empty');
      return;
    }
    setSuperAdminPassword(newAdminPassword);
    setNewAdminPassword('');
    alert('Super Admin Password updated successfully');
  };

  const handleUnlock = () => {
    if (checkSuperAdminPassword(unlockPassword)) {
      setIsLocked(false);
      setPasswordError(false);
      fetchProfiles();
    } else {
      setPasswordError(true);
    }
  };

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const data = await getAllProfiles();
    setProfiles(data);
    setLoadingProfiles(false);
  };

  const handleUpdateUser = async (userId: string, role: 'super_admin' | 'user', months: number) => {
    try {
      const subscription_end = new Date();
      subscription_end.setMonth(subscription_end.getMonth() + months);
      
      await updateUserProfile(userId, { 
        role, 
        subscription_period: months,
        subscription_end: subscription_end.toISOString()
      });
      
      alert('User updated successfully');
      fetchProfiles();
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update user');
    }
  };

  if (isLocked) {
    return (
      <div className="p-6 md:p-10 max-w-md mx-auto space-y-8 mt-20">
        <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
          <CardContent className="p-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-[#6C5CE7]/10 rounded-2xl flex items-center justify-center text-[#6C5CE7] mb-4">
              <Lock size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Settings Locked</h2>
              <p className="text-gray-500 text-sm">Enter Super Admin Password to access configuration</p>
            </div>
            <div className="space-y-4">
              <Input 
                type="password" 
                placeholder="Enter password" 
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className={`rounded-xl h-12 text-center ${passwordError ? 'border-red-500' : ''}`}
              />
              {passwordError && <p className="text-red-500 text-xs">Incorrect password. Please try again.</p>}
              <Button onClick={handleUnlock} className="w-full h-12 rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bc4]">
                Unlock Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#6C5CE7]/10 rounded-2xl text-[#6C5CE7]">
          <Settings size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your TCM Master configuration</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <Database size={20} className="text-[#6C5CE7]" />
                Supabase Configuration
              </div>
              {isExternal && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  Using External Database
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Supabase URL</label>
                  <Input 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Supabase Anon Key</label>
                  <Input 
                    value={key} 
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="your-anon-key"
                    type="password"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  onClick={handleSaveSupabase}
                  className="rounded-xl gap-2 bg-[#6C5CE7] hover:bg-[#5b4bc4]"
                >
                  <Save size={18} />
                  Save Supabase
                </Button>
                
                {isExternal && (
                  <Button 
                    variant="outline"
                    onClick={handleResetSupabase}
                    className="rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw size={18} />
                    Reset Supabase
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <Brain size={20} className="text-[#6C5CE7]" />
                Gemini AI Configuration
              </div>
              {isGeminiExternal && (
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  Using Custom API Key
                </span>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gemini API Key</label>
                <Input 
                  value={geminiKey} 
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="your-gemini-api-key"
                  type="password"
                  className="rounded-xl"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  onClick={handleSaveGemini}
                  className="rounded-xl gap-2 bg-[#6C5CE7] hover:bg-[#5b4bc4]"
                >
                  <Save size={18} />
                  Save API Key
                </Button>
                
                {isGeminiExternal && (
                  <Button 
                    variant="outline"
                    onClick={handleResetGemini}
                    className="rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw size={18} />
                    Reset API Key
                  </Button>
                )}
              </div>

              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="text-purple-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-bold text-purple-900">Custom AI Key</h3>
                    <p className="text-purple-800 text-sm leading-relaxed mt-1">
                      Anda dapat menggunakan API Key Gemini Anda sendiri untuk memastikan kuota AI tetap tersedia bagi Anda secara eksklusif.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                <Users size={20} className="text-[#6C5CE7]" />
                User Management
              </div>
              <Button variant="ghost" onClick={fetchProfiles} className="text-[#6C5CE7] h-9 px-3">
                <RotateCcw size={16} className="mr-2" /> Refresh
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Subscription</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingProfiles ? (
                    <tr><td colSpan={4} className="text-center py-4">Loading users...</td></tr>
                  ) : profiles.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-4">No users found</td></tr>
                  ) : profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-gray-900">{p.email}</td>
                      <td className="px-4 py-4">
                        <select 
                          value={p.role} 
                          onChange={(e) => handleUpdateUser(p.id, e.target.value as any, p.subscription_period)}
                          className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-[#6C5CE7]"
                        >
                          <option value="user">User</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <select 
                            value={p.subscription_period} 
                            onChange={(e) => handleUpdateUser(p.id, p.role, parseInt(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-[#6C5CE7]"
                          >
                            <option value={1}>1 Month</option>
                            <option value={3}>3 Months</option>
                            <option value={6}>6 Months</option>
                            <option value={9}>9 Months</option>
                            <option value={12}>1 Year</option>
                          </select>
                          {p.subscription_end && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Calendar size={10} /> Ends: {new Date(p.subscription_end).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {new Date(p.subscription_end || 0) > new Date() ? (
                            <span className="text-green-500 flex items-center gap-1 text-xs font-bold">
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1 text-xs font-bold">
                              <AlertCircle size={14} /> Expired
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">
              <Shield size={20} className="text-[#6C5CE7]" />
              Security (Super Admin)
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Change Super Admin Password</label>
                <div className="flex gap-2">
                  <Input 
                    type="password"
                    placeholder="New password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button onClick={handleSetAdminPassword} className="rounded-xl gap-2">
                    <Key size={18} /> Update
                  </Button>
                </div>
                <p className="text-xs text-gray-400">Password ini digunakan untuk mengunci halaman pengaturan ini.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4">
              <User size={20} className="text-[#6C5CE7]" />
              Doctor Profile
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 italic">Profile management features coming soon...</p>
              <Button disabled className="rounded-xl">Update Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
