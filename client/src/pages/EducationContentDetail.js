import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaArrowLeft, 
  FaClock, 
  FaEye, 
  FaBook, 
  FaVideo, 
  FaQuestionCircle,
  FaBookmark,
  FaShare,
  FaUtensils,
  FaBrain,
  FaShower,
  FaShieldAlt,
  FaHeart,
  FaGlobe
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const EducationContentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: content, isLoading, error } = useQuery(
    ['education-content', id],
    async () => {
      const response = await axios.get(`/api/education/content/${id}`);
      return response.data;
    }
  );

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const categoryIcons = {
    nutrition: FaUtensils,
    mental_wellness: FaBrain,
    hygiene: FaShower,
    preventive_care: FaShieldAlt,
    sexual_health: FaHeart,
    emergency: FaShieldAlt
  };

  const typeIcons = {
    article: FaBook,
    video: FaVideo,
    quiz: FaQuestionCircle,
    guide: FaBookmark
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <LoadingSpinner className="min-h-[400px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Not Found</h2>
          <p className="text-gray-600 mb-6">The requested content could not be loaded.</p>
          <Link 
            to="/education" 
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Back to Education Hub
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[content.category] || FaBook;
  const TypeIcon = typeIcons[content.type] || FaBook;

  // Format content with line breaks
  const formattedContent = content.content?.split('\n').map((paragraph, index) => {
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
      return (
        <li key={index} className="flex items-start mb-2">
          <span className="text-teal-500 mr-2">•</span>
          <span className="text-gray-700">{paragraph.replace(/^[•\-]\s*/, '')}</span>
        </li>
      );
    }
    
    if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
      return (
        <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
          {paragraph.replace(/\*\*/g, '')}
        </h3>
      );
    }
    
    if (paragraph.trim() === '') {
      return <br key={index} />;
    }
    
    return (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition"
            >
              <FaArrowLeft />
              <span>Back to Education Hub</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-teal-500 transition">
                <FaBookmark />
              </button>
              <button className="p-2 text-gray-400 hover:text-teal-500 transition">
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Content Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-aos="fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${
                content.type === 'video' ? 'bg-red-100 text-red-600' :
                content.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                content.type === 'article' ? 'bg-blue-100 text-blue-600' :
                'bg-green-100 text-green-600'
              }`}>
                <TypeIcon className="text-xl" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <CategoryIcon className="text-teal-500" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {content.category.replace('_', ' ')}
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {content.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {content.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FaClock className="text-teal-500" />
                <span>{content.readingTime || '5'} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEye className="text-teal-500" />
                <span>{content.viewCount || '0'} views</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-teal-500" />
                <span className="uppercase">{content.language}</span>
              </div>
              {content.difficulty && (
                <div className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  {content.difficulty}
                </div>
              )}
            </div>
          </div>

          {/* Video Embed */}
          {content.type === 'video' && content.mediaUrl && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8" data-aos="fade-up">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Watch Video</h3>
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  src={content.mediaUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={content.title}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8" data-aos="fade-up">
            {content.type === 'quiz' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaQuestionCircle className="text-purple-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Ready to Test Your Knowledge?
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  This quiz contains questions to help you assess your understanding of this topic.
                </p>
                <Link
                  to={`/education/quiz/${content.id}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold"
                >
                  <FaQuestionCircle />
                  Start Quiz
                </Link>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {formattedContent}
                </div>
                
                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8" data-aos="fade-up">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-teal-600 transition font-semibold"
            >
              <FaArrowLeft />
              Back to List
            </button>
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-teal-500 transition">
                <FaBookmark />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-teal-500 transition">
                <FaShare />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationContentDetail;