import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Users, 
  Map as MapIcon, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui';
import { supabase } from '../services/supabaseClient';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Diagnosis', path: '/diagnosis', icon: Stethoscope },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Meridian', path: '/meridian', icon: MapIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FF]">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#6C5CE7]">TCM MASTER</h1>
          <p className="text-xs text-gray-500">Professional AI System</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-[#6C5CE7] text-white' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-gray-500 hover:text-red-500"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
        <h1 className="text-lg font-bold text-[#6C5CE7]">TCM MASTER</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6 space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl ${
                  isActive ? 'bg-[#6C5CE7] text-white' : 'text-gray-500'
                }`}
              >
                <Icon size={24} />
                <span className="text-lg font-medium">{item.name}</span>
              </Link>
            );
          })}
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-gray-500 pt-8"
            onClick={handleLogout}
          >
            <LogOut size={24} />
            <span className="text-lg">Logout</span>
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
