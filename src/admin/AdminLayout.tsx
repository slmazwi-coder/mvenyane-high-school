import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from './utils/storage';
import {
  Newspaper,
  Info,
  Trophy,
  FileText,
  Activity,
  Users,
  Phone,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ArrowLeft,
  FolderUp,
} from 'lucide-react';

const adminTabs = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/news', label: 'News', icon: Newspaper },
  { path: '/admin/about', label: 'About', icon: Info },
  { path: '/admin/achievements', label: 'Achievements', icon: Trophy },
  { path: '/admin/documents', label: 'Documents', icon: FileText },
  // Still uses the same editor under the hood, but wording matches the public website.
  { path: '/admin/extra-curricular', label: 'Sport & Activities', icon: Activity },
  { path: '/admin/applications', label: 'Applications', icon: Users },
  { path: '/admin/student-documents', label: 'Student Docs', icon: FolderUp },
  { path: '/admin/contact', label: 'Contact', icon: Phone },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const goBackToSite = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-red-600 text-white text-center py-1 text-xs font-bold uppercase tracking-widest">
        ⚙ Admin Mode — Changes affect the live website
      </div>

      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={goBackToSite}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                aria-label="Back to website"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <Link to="/admin" className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-school-green">MHSS</span> Staff Portal
              </Link>

              <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-tighter">
                <ShieldCheck size={12} />
                Anti-Malicious Defense Active
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-school-green text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <div className="md:hidden overflow-x-auto px-2 pb-2 flex gap-1">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium ${
                  isActive ? 'bg-school-green text-white' : 'text-gray-400 bg-gray-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
