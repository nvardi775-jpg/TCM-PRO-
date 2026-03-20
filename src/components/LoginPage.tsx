import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Card, CardContent, Button, Input } from './ui';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setError('Check your email for confirmation link');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-3xl shadow-xl overflow-hidden border-none">
        <div className="bg-[#6C5CE7] p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">TCM MASTER</h1>
          <p className="text-white/80">AI Diagnostic System - Maciocia Based</p>
        </div>
        
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} /> Email
              </label>
              <Input 
                type="email" 
                placeholder="doctor@tcm.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">New Doctor?</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl"
            onClick={handleSignUp}
            disabled={loading}
          >
            Register Account
          </Button>

          <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed">
            <strong>💡 Cara Akses:</strong> Masukkan email & password pilihan Anda, lalu klik <strong>Register Account</strong> untuk membuat akun pertama Anda.
          </div>

          <p className="text-center text-xs text-gray-400">
            Professional Access Only. Contact Admin for Support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
