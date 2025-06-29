import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  created_at: string;
  updated_at: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      const delayedSearch = setTimeout(() => {
        performSearch();
      }, 500);

      return () => clearTimeout(delayedSearch);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = (content: string) => {
    // Remove HTML tags and get first 200 characters
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Find documents across your knowledge base
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
            placeholder="Search for documents, content, or authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && query.length > 2 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search terms or browse all documents from the dashboard.
            </p>
          </div>
        )}

        {!loading && !hasSearched && query.length <= 2 && (
          <div className="text-center py-12">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Start searching</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter at least 3 characters to search for documents.
            </p>
          </div>
        )}

        {results.map((result) => (
          <div
            key={result.id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/document/${result.id}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h3 
                      className="text-lg font-medium text-gray-900"
                      dangerouslySetInnerHTML={{ __html: result.title }}
                    />
                  </Link>
                  <div 
                    className="mt-2 text-sm text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: getPreviewText(result.content) }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {result.author_name}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(result.updated_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <Link
                  to={`/document/${result.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View document →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Tips */}
      {!hasSearched && (
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Search for specific words or phrases in document titles and content</li>
            <li>• Use author names to find documents by specific team members</li>
            <li>• Search results include both public and private documents you have access to</li>
            <li>• Use quotation marks for exact phrase matching</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;