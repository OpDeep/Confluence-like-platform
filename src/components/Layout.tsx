import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Plus, 
  Bell, 
  User, 
  LogOut,
  Menu,
  Home,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Notification {
  id: number;
  document_title: string;
  mentioning_user_name: string;
  is_read: boolean;
  created_at: string;
}

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/mentions');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await axios.put(`http://localhost:5000/api/users/mentions/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNewDocument = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/documents', {
        title: 'Untitled Document',
        content: '',
        isPublic: false
      });
      
      navigate(`/document/${response.data.id}/edit`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 fixed w-full top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/25">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                      KnowledgeBase
                    </span>
                    <div className="text-xs text-slate-500 -mt-0.5">Team Collaboration</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end max-w-lg">
              <div className="w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  Search documents
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200/60 rounded-xl bg-white/70 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200 hover:bg-white/90"
                    placeholder="Search documents..."
                    type="search"
                    onFocus={() => navigate('/search')}
                  />
                </div>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewDocument}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl relative transition-all duration-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-slate-50/80 cursor-pointer border-l-4 transition-colors ${
                              notification.is_read ? 'border-transparent' : 'border-blue-500 bg-blue-50/50'
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="text-sm text-slate-900">
                              <span className="font-medium">{notification.mentioning_user_name}</span> mentioned you in{' '}
                              <span className="font-medium">{notification.document_title}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-slate-100/80 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-700 hidden sm:block font-medium">{user?.name}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 transition-colors rounded-lg mx-2"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Profile Settings
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 transition-colors rounded-lg mx-2"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 pt-16 lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out lg:transition-none shadow-2xl lg:shadow-none`}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
                to="/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>

              <Link
                to="/search"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/search')
                    ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Search className="h-5 w-5 mr-3" />
                Search
              </Link>

              <Link
                to="/profile"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive('/profile')
                    ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Profile
              </Link>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          <main className="min-h-screen">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;