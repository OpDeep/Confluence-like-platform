import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Share, 
  Globe, 
  Lock, 
  User, 
  Clock,
  ArrowLeft,
  History,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  permissions: Array<{
    id: number;
    name: string;
    email: string;
    permission: string;
  }>;
}

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${id}`);
      setDocument(response.data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Document not found</h2>
          <p className="mt-2 text-gray-600">The document you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/dashboard"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              to={`/document/${document.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Share className="h-4 w-4 mr-2" />
              Share
            </button>
            <button className="p-2 border border-gray-300 rounded-md text-gray-400 hover:text-gray-500">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Meta */}
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {document.author_name}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated {format(new Date(document.updated_at), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center">
              {document.is_public ? (
                <>
                  <Globe className="h-4 w-4 mr-1 text-green-500" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Private
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-8 py-6">
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
          {!document.content && (
            <p className="text-gray-500 italic">This document is empty.</p>
          )}
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Info</h3>
        
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(document.created_at), 'MMMM d, yyyy')}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Last modified</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(new Date(document.updated_at), 'MMMM d, yyyy')}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Visibility</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {document.is_public ? 'Public' : 'Private'}
            </dd>
          </div>

          {document.permissions.length > 0 && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Shared with</dt>
              <dd className="mt-1">
                <ul className="space-y-1">
                  {document.permissions.map((permission) => (
                    <li key={permission.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{permission.name}</span>
                      <span className="text-gray-500 capitalize">{permission.permission}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
            <History className="h-4 w-4 mr-1" />
            View Version History
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;