import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Globe, 
  Lock, 
  Share,
  Eye,
  Settings,
  Users,
  Mail,
  X,
  Check,
  History,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: number;
  title: string;
  content: string;
  is_public: boolean;
  author_id: number;
  permissions?: Array<{
    id: number;
    name: string;
    email: string;
    permission: string;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const DocumentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewDocument, setIsNewDocument] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Auto-save functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchDocument();
    } else {
      // New document
      setIsNewDocument(true);
      setTitle('Untitled Document');
      setContent('');
      setIsPublic(false);
      setLoading(false);
    }
  }, [id]);

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || isNewDocument) return;

    const autoSaveInterval = setInterval(() => {
      handleSave(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, title, content, isPublic]);

  // Search users effect
  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayedSearch = setTimeout(() => {
        searchUsersForSharing();
      }, 300);
      return () => clearTimeout(delayedSearch);
    } else {
      setSearchUsers([]);
    }
  }, [searchQuery]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${id}`);
      const doc = response.data;
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content);
      setIsPublic(doc.is_public);
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Document not found');
        navigate('/dashboard');
      } else {
        toast.error('Failed to fetch document');
      }
    } finally {
      setLoading(false);
    }
  };

  const searchUsersForSharing = async () => {
    setSearchLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?q=${searchQuery}`);
      setSearchUsers(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (saving) return;
    
    setSaving(true);

    try {
      if (isNewDocument) {
        // Create new document
        const response = await axios.post('http://localhost:5000/api/documents', {
          title,
          content,
          isPublic
        });
        
        setDocument({ 
          id: response.data.id, 
          title, 
          content, 
          is_public: isPublic,
          author_id: user?.id || 0
        });
        setIsNewDocument(false);
        
        // Update URL to reflect the new document ID
        window.history.replaceState(null, '', `/document/${response.data.id}/edit`);
        
        if (!isAutoSave) {
          toast.success('Document created successfully');
        }
      } else {
        // Update existing document
        await axios.put(`http://localhost:5000/api/documents/${id}`, {
          title,
          content,
          isPublic
        });
        
        if (!isAutoSave) {
          toast.success('Document saved successfully');
        }
      }
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleShareDocument = async (userEmail: string, permission: 'view' | 'edit') => {
    try {
      await axios.post(`http://localhost:5000/api/documents/${document?.id}/share`, {
        userEmail,
        permission
      });
      toast.success('Document shared successfully');
      setShareModalOpen(false);
      setSearchQuery('');
      setSearchUsers([]);
      // Refresh document to get updated permissions
      fetchDocument();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to share document');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasUnsavedChanges(true);
    
    // Process mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...e.target.value.matchAll(mentionRegex)];
    // Handle mentions here if needed
  };

  const handlePublicToggle = () => {
    setIsPublic(!isPublic);
    setHasUnsavedChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={document ? `/document/${document.id}` : '/dashboard'}
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {document ? 'View' : 'Dashboard'}
              </Link>
              
              <div className="h-6 border-l border-slate-300"></div>
              
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="text-lg font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-slate-400"
                placeholder="Document title..."
              />
              
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  • Unsaved changes
                </span>
              )}
              
              {lastSaved && (
                <span className="text-xs text-slate-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Visibility Toggle */}
              <button
                onClick={handlePublicToggle}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isPublic
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Private
                  </>
                )}
              </button>

              {/* Preview Button */}
              {!isNewDocument && (
                <Link
                  to={`/document/${document?.id}`}
                  className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Link>
              )}

              {/* Share Button */}
              <button 
                onClick={() => setShareModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </button>

              {/* Save Button */}
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-xl">
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full min-h-screen border-none resize-none focus:outline-none focus:ring-0 text-slate-900 text-base leading-relaxed p-8 bg-transparent placeholder-slate-400 rounded-2xl"
            placeholder="Start writing your document... Use @username to mention team members."
            style={{ minHeight: 'calc(100vh - 300px)' }}
          />
        </div>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
              <h3 className="text-lg font-semibold text-slate-900">Share Document</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search users by email or name
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email or name..."
                />
              </div>

              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {searchUsers.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchUsers.map((searchUser) => (
                    <div key={searchUser.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <div className="font-medium text-slate-900">{searchUser.name}</div>
                        <div className="text-sm text-slate-500">{searchUser.email}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShareDocument(searchUser.email, 'view')}
                          className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleShareDocument(searchUser.email, 'edit')}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {document?.permissions && document.permissions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Current Access</h4>
                  <div className="space-y-2">
                    {document.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <div className="font-medium text-slate-900">{permission.name}</div>
                          <div className="text-sm text-slate-500">{permission.email}</div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg capitalize">
                          {permission.permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEdit;