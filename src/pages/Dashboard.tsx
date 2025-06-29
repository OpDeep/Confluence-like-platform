import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Clock, 
  User, 
  Globe, 
  Lock,
  MoreVertical,
  Edit,
  Trash2,
  Share,
  Eye,
  Users,
  Calendar,
  Filter,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  author_id: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my' | 'shared'>('all');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, filter, user]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    if (!user) return;

    let filtered = documents;
    
    switch (filter) {
      case 'my':
        filtered = documents.filter(doc => doc.author_id === user.id);
        break;
      case 'shared':
        filtered = documents.filter(doc => doc.author_id !== user.id);
        break;
      default:
        filtered = documents;
    }
    
    setFilteredDocuments(filtered);
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
      toast.error('Failed to create document');
    }
  };

  const handleDeleteDocument = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getPreviewText = (content: string) => {
    return content.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const myDocs = documents.filter(doc => doc.author_id === user?.id).length;
    const sharedDocs = documents.filter(doc => doc.author_id !== user?.id).length;
    const publicDocs = documents.filter(doc => doc.is_public).length;

    return { total, myDocs, sharedDocs, publicDocs };
  };

  const stats = getDocumentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-600 text-lg">
              Manage and organize your knowledge base
            </p>
          </div>
          <button
            onClick={handleNewDocument}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white text-sm font-medium rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Documents</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">My Documents</p>
                <p className="text-3xl font-bold text-slate-900">{stats.myDocs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Shared with Me</p>
                <p className="text-3xl font-bold text-slate-900">{stats.sharedDocs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Public Documents</p>
                <p className="text-3xl font-bold text-slate-900">{stats.publicDocs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-1.5 shadow-lg">
          <nav className="flex space-x-1">
            {[
              { key: 'all', label: 'All Documents', count: stats.total, icon: BookOpen },
              { key: 'my', label: 'My Documents', count: stats.myDocs, icon: User },
              { key: 'shared', label: 'Shared with Me', count: stats.sharedDocs, icon: Users }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
                <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-medium ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-32 h-32 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
            <FileText className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No documents found</h3>
          <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg">
            {filter === 'all' 
              ? "Get started by creating your first document."
              : filter === 'my'
              ? "You haven't created any documents yet."
              : "No documents have been shared with you yet."
            }
          </p>
          <button
            onClick={handleNewDocument}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white text-base font-medium rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocuments.map((document) => (
            <div
              key={document.id}
              className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              onClick={() => navigate(`/document/${document.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 truncate mb-3 group-hover:text-blue-600 transition-colors">
                      {document.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {getPreviewText(document.content)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDropdownOpen(dropdownOpen === document.id ? null : document.id);
                      }}
                      className="p-2 rounded-xl hover:bg-slate-100/80 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>
                    
                    {dropdownOpen === document.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 py-2 z-10">
                        <Link
                          to={`/document/${document.id}`}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 rounded-lg mx-2 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(null);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-3" />
                          View
                        </Link>
                        <Link
                          to={`/document/${document.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 rounded-lg mx-2 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(null);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          Edit
                        </Link>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50/80 rounded-lg mx-2 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(null);
                          }}
                        >
                          <Share className="h-4 w-4 mr-3" />
                          Share
                        </button>
                        {document.author_id === user?.id && (
                          <>
                            <hr className="my-2 border-slate-100" />
                            <button
                              onClick={(e) => {
                                handleDeleteDocument(document.id, e);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 rounded-lg mx-2 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-slate-500">
                      <User className="h-3 w-3 mr-1" />
                      <span className="truncate max-w-24">{document.author_name}</span>
                    </div>
                    <div className="flex items-center">
                      {document.is_public ? (
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <Globe className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">Public</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          <Lock className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">Private</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-xs">
                      {format(new Date(document.updated_at), 'MMM d')}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/document/${document.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-slate-200/60 text-sm font-medium rounded-xl text-slate-700 bg-white/50 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Link>
                  <Link
                    to={`/document/${document.id}`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-sm font-medium rounded-xl text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;