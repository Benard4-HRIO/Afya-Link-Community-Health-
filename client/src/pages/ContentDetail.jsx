import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaClock, 
  FaEye, 
  FaBook, 
  FaQuestionCircle,
  FaUtensils,
  FaBrain,
  FaShower,
  FaShieldAlt,
  FaExclamationTriangle,
  FaDatabase
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000/api';

const ContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching content for ID:', id);
        
        // ✅ Fixed: Added parentheses for operator clarity
        if (id && (id.includes('-article-') || id.includes('-video-') || id.includes('-quiz-'))) {
          console.warn('⚠️ Using mock data ID - this will likely fail with real database');
        }
        
        const apiUrl = `${API_BASE_URL}/education/content/${id}`;
        console.log('🌐 Making API call to:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('✅ API Response status:', response.status);
        console.log('📦 Content received:', response.data);
        
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        setContent(response.data);
        
      } catch (err) {
        console.error('💥 API Error Details:', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        
        if (err.response?.status === 404) {
          setError(`Content not found. The ID "${id}" doesn't exist in the database.`);
        } else if (err.response?.status === 500) {
          setError('Server error. Please check if your backend is running properly.');
        } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
          setError('Cannot connect to the server. Make sure your backend is running on port 5000.');
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || 'Failed to load content. Please try again.');
        }
      } finally {
        setLoading(false);
        console.log('🏁 Loading complete');
      }
    };

    fetchContent();
  }, [id]);

  const categoryIcons = {
    nutrition: FaUtensils,
    mental_wellness: FaBrain,
    hygiene: FaShower,
    preventive_care: FaShieldAlt,
    sexual_health: FaShieldAlt,
    emergency: FaShieldAlt
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-red-500" />
              <h2 className="text-xl font-bold">Error Loading Content</h2>
            </div>
            <p className="text-sm mb-4">{error}</p>
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <p><strong>Content ID:</strong> {id}</p>
              <p><strong>Issue:</strong> This ID doesn't exist in the database</p>
            </div>
          </div>

          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FaDatabase className="text-yellow-500" />
              <h3 className="font-semibold">Solution</h3>
            </div>
            <p className="text-sm text-left">
              1. Make sure your backend is running on port 5000<br/>
              2. Run your seed file to populate the database<br/>
              3. Use content from the Education page (not mock data)
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/education')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition font-semibold"
            >
              Back to Education Hub
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[content.category] || FaBook;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/education')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition font-semibold"
          >
            <FaArrowLeft />
            <span>{content.language === 'sw' ? 'Rudi kwa Elimu' : 'Back to Education'}</span>
          </button>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FaClock />
              <span>{content.readingTime || '5'} min</span>
            </div>
            <div className="flex items-center gap-1">
              <FaEye />
              <span>{content.viewCount || '0'} views</span>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <CategoryIcon className="text-teal-600" />
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
              {content.category?.replace('_', ' ') || 'Unknown'}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
              {content.type || 'Unknown'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content.title || 'Untitled'}
          </h1>

          {content.description && (
            <p className="text-xl text-gray-600 mb-6">
              {content.description}
            </p>
          )}

          {content.type === 'video' && content.mediaUrl && (
            <div className="mb-8">
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(content.mediaUrl)}
                  title={content.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full min-h-[400px]"
                />
              </div>
            </div>
          )}

          {(content.type === 'article' || content.type === 'guide') && content.content && (
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {content.content}
              </div>
            </div>
          )}

          {content.type === 'quiz' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaQuestionCircle className="text-purple-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {content.language === 'sw' ? 'Jaribio la Maarifa' : 'Knowledge Quiz'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {content.language === 'sw' 
                  ? 'Jaribio hili lina maswali ya kukupima uelewa wako wa mada hii.'
                  : 'This quiz contains questions to test your understanding of this topic.'}
              </p>
              <button
                onClick={() => navigate(`/education/quiz/${content.id}`)}
                className="px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
              >
                {content.language === 'sw' ? 'Anza Jaribio' : 'Start Quiz'}
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Language: {content.language?.toUpperCase() || 'EN'}</span>
              {content.difficulty && (
                <span>Difficulty: {content.difficulty}</span>
              )}
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  Tags: 
                  {content.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
