import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { getUserProfile, UserProfile } from './services/userService';
import { Shield, AlertCircle } from 'lucide-react';
import { Button, Card } from './components/ui';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import DiagnosisPage from './components/DiagnosisPage';
import PatientsPage from './components/PatientsPage';
import MeridianPage from './components/MeridianPage';
import SettingsPage from './components/SettingsPage';
import QuickDiagnosis from './components/QuickDiagnosis';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingKeys, setMissingKeys] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isMissing = !url || !key || url === 'https://placeholder.supabase.co' || key === 'placeholder';
    
    if (isMissing) {
      setMissingKeys(true);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Show timeout message after 5 seconds
    const timeoutMsgId = setTimeout(() => {
      if (isMounted && loading) {
        setShowTimeoutMessage(true);
      }
    }, 5000);

    const initAuth = async () => {
      // Safety timeout to ensure the app loads even if Supabase is slow or hanging
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth initialization timed out');
          setLoading(false);
        }
      }, 10000);

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(initialSession);
        if (initialSession?.user) {
          const userProfile = await getUserProfile(initialSession.user.id);
          if (isMounted) setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          clearTimeout(timeoutMsgId);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id);
        if (isMounted) setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutMsgId);
    };
  }, []);

  const isSubscriptionActive = () => {
    if (!profile) return true; // Default to true if no profile yet
    if (profile.role === 'super_admin') return true;
    if (!profile.subscription_end) return false;
    return new Date(profile.subscription_end) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 space-y-6">
        <div className="w-12 h-12 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin" />
        {showTimeoutMessage && (
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <div className="space-y-2">
              <p className="text-gray-600 font-medium">Initializing TCM Master...</p>
              <p className="text-xs text-gray-400 max-w-xs">This is taking longer than usual. It might be a connection issue with the database.</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-xl border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7]/5"
              onClick={() => setLoading(false)}
            >
              Skip Loading & Try Anyway
            </Button>
          </div>
        )}
      </div>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!session) return <Navigate to="/login" replace />;
    if (!isSubscriptionActive()) {
      return (
        <Layout>
          <div className="flex flex-col items-center justify-center h-[80vh] text-center p-10 space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <Shield size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Subscription Expired</h1>
              <p className="text-gray-500 max-w-md">Your access period has ended. Please contact the Super Admin to renew your subscription.</p>
            </div>
            <Button onClick={() => supabase.auth.signOut()} variant="outline" className="rounded-xl">
              Sign Out
            </Button>
          </div>
        </Layout>
      );
    }
    return <Layout children={children} />;
  };

  return (
    <BrowserRouter>
      {missingKeys && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-center text-amber-800 text-sm font-medium sticky top-0 z-[100]">
          ⚠️ Supabase keys are missing. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your secrets.
        </div>
      )}
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
        />


        {/* Protected Routes */}
        <Route
          path="/"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/diagnosis"
          element={<ProtectedRoute><DiagnosisPage /></ProtectedRoute>}
        />
        <Route
          path="/quick-diagnosis"
          element={<ProtectedRoute><QuickDiagnosis /></ProtectedRoute>}
        />
        <Route
          path="/patients"
          element={<ProtectedRoute><PatientsPage /></ProtectedRoute>}
        />
        <Route
          path="/meridian"
          element={<ProtectedRoute><MeridianPage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
