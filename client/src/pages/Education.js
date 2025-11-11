import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaGlobe, FaSearch, FaBook, FaVideo, FaQuestionCircle, 
  FaStar, FaBookmark, FaClock, FaEye, FaTh, FaList,
  FaPlay, FaUtensils, FaBrain, FaShower, FaShieldAlt,
  FaHeart, FaShare, FaFilter
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Education = () => {
  const [filters, setFilters] = useState({
    language: 'en',
    category: '',
    type: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });
  }, []);

  const { data: categories, isLoading: loadingCategories } = useQuery(
    ['edu-categories', filters.language],
    async () => (await axios.get('/api/education/categories', { params: { language: filters.language } })).data
  );

  const { data: contentData, isLoading: loadingContent } = useQuery(
    ['edu-content', filters],
    async () => {
      // For demo purposes, we'll use mock data if API not ready
      try {
        const response = await axios.get('/api/education/content', { params: filters });
        return response.data;
      } catch (error) {
        // Return mock data if API fails
        return getMockEducationContent(filters);
      }
    },
  );

  const content = contentData?.content || contentData || [];

  const typeOptions = [
    { value: '', label: 'All Types', icon: FaTh },
    { value: 'article', label: 'Articles', icon: FaBook },
    { value: 'video', label: 'Videos', icon: FaVideo },
    { value: 'quiz', label: 'Quizzes', icon: FaQuestionCircle },
    { value: 'guide', label: 'Guides', icon: FaBookmark }
  ];

  const categoryIcons = {
    nutrition: FaUtensils,
    mental_wellness: FaBrain,
    hygiene: FaShower,
    preventive_care: FaShieldAlt,
    sexual_health: FaHeart,
    emergency: FaShieldAlt
  };

  const renderContentCard = (item) => {
    const CategoryIcon = categoryIcons[item.category] || FaBook;
    
    return (
      <div
        key={item.id}
        className={`bg-white/10 rounded-2xl shadow-lg backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all duration-300 group ${
          viewMode === 'grid' ? 'p-6' : 'p-6 flex items-start gap-6'
        }`}
        data-aos="fade-up"
      >
        {/* Content Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              item.type === 'video' ? 'bg-red-500/20 text-red-300' :
              item.type === 'quiz' ? 'bg-purple-500/20 text-purple-300' :
              item.type === 'article' ? 'bg-blue-500/20 text-blue-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              {item.type === 'video' && <FaVideo className="text-sm" />}
              {item.type === 'quiz' && <FaQuestionCircle className="text-sm" />}
              {item.type === 'article' && <FaBook className="text-sm" />}
              {item.type === 'guide' && <FaBookmark className="text-sm" />}
            </div>
            <div className="flex items-center gap-1 text-blue-200 text-sm">
              <CategoryIcon className="text-xs" />
              <span className="capitalize">{item.category.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <FaStar />
            <span>{item.rating || '4.5'}</span>
          </div>
        </div>

        {/* Content */}
        <div className={viewMode === 'grid' ? '' : 'flex-1'}>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
            {item.title}
          </h3>
          
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Video Preview */}
          {item.type === 'video' && item.mediaUrl && (
            <div className="relative rounded-xl overflow-hidden mb-4 bg-black/20">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 transition-colors">
                    <FaPlay className="text-white ml-1" />
                  </div>
                  <p className="text-white text-sm">Click to watch video</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FaGlobe />
                <span>{item.language?.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock />
                <span>{item.readingTime || '5'} min</span>
              </div>
              <div className="flex items-center gap-1">
                <FaEye />
                <span>{item.viewCount || '0'} views</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1 hover:text-teal-300 transition-colors">
                <FaBookmark className="text-sm" />
              </button>
              <button className="p-1 hover:text-teal-300 transition-colors">
                <FaShare className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-2 mt-4 ${viewMode === 'list' ? 'ml-auto pl-4' : ''}`}>
          <Link
            to={`/education/content/${item.id}`}
            className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-500/80 text-white hover:bg-blue-600 transition-colors text-center"
          >
            {filters.language === 'sw' ? 'Fungua' : 'Open'}
          </Link>
          {item.type === 'quiz' && (
            <Link
              to={`/education/quiz/${item.id}`}
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-green-500/80 text-white hover:bg-green-600 transition-colors text-center"
            >
              {filters.language === 'sw' ? 'Jaribu' : 'Take Quiz'}
            </Link>
          )}
          {item.type === 'video' && (
            <a
              href={item.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition-colors text-center flex items-center justify-center gap-1"
            >
              <FaPlay className="text-xs" />
              Watch
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative bg-fixed"
      style={{
        backgroundImage:
          "url('https://media.istockphoto.com/id/1327568875/photo/healthcare-business-graph-data-and-growth-insurance-healthcare-doctor-analyzing-medical-of.jpg?s=612x612&w=0&k=20&c=R4idIeTPq0f1TPSJwAq4KUeLUQg6ul8eIBSjvs9MXQk=')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-gray-900/90 backdrop-blur-sm"></div>

      <div className="relative z-10 container mx-auto px-4 py-10 text-white">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4"
          data-aos="fade-down"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-md bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent">
              {filters.language === 'sw' ? 'Kituo cha Elimu ya Afya' : 'Health Education Hub'}
            </h1>
            <p className="text-blue-100 max-w-xl text-lg">
              {filters.language === 'sw'
                ? 'Jifunze kuhusu usafi, lishe, afya ya uzazi, na afya ya akili kwa lugha unayoelewa.'
                : 'Learn about hygiene, nutrition, reproductive health, and mental wellness in your preferred language.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl shadow-md backdrop-blur-sm">
              <FaGlobe className="text-teal-300" />
              <select
                className="bg-transparent border-none outline-none text-white font-medium"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/20 rounded-xl p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:text-white'
                }`}
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-teal-500 text-white' : 'text-blue-200 hover:text-white'
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1" data-aos="fade-right">
            <div className="bg-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-md border border-white/10 sticky top-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FaFilter className="text-teal-300" /> 
                {filters.language === 'sw' ? 'Vichujio' : 'Filters'}
              </h3>

              <div className="space-y-5">
                {/* Search */}
                <div>
                  <label className="block mb-2 text-sm text-blue-100 font-medium">
                    {filters.language === 'sw' ? 'Tafuta' : 'Search'}
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                    <input
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={filters.language === 'sw' ? 'Tafuta maudhui…' : 'Search content…'}
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block mb-2 text-sm text-blue-100 font-medium">
                    {filters.language === 'sw' ? 'Aina ya maudhui' : 'Content Type'}
                  </label>
                  <div className="space-y-2">
                    {typeOptions.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFilters({ ...filters, type: type.value })}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            filters.type === type.value 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-white/10 text-blue-100 hover:bg-white/20'
                          }`}
                        >
                          <Icon className="text-sm" />
                          <span>{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block mb-2 text-sm text-blue-100 font-medium">
                    {filters.language === 'sw' ? 'Kategoria' : 'Category'}
                  </label>
                  <select
                    className="w-full px-3 py-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="" className="text-gray-900">
                      {filters.language === 'sw' ? 'Kategoria zote' : 'All categories'}
                    </option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id} className="text-gray-900">
                        {c.name} ({c.contentCount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block mb-2 text-sm text-blue-100 font-medium">
                    {filters.language === 'sw' ? 'Panga kwa' : 'Sort by'}
                  </label>
                  <select
                    className="w-full px-3 py-3 rounded-xl bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest" className="text-gray-900">Newest First</option>
                    <option value="popular" className="text-gray-900">Most Popular</option>
                    <option value="rating" className="text-gray-900">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6" data-aos="fade-up">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {filters.language === 'sw' ? 'Maudhui Yaliyopatikana' : 'Available Content'}
                </h2>
                <p className="text-blue-200">
                  {content.length} {filters.language === 'sw' ? 'vipengee vilivyopatikana' : 'items found'}
                </p>
              </div>
              
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  {filters.language === 'sw' ? 'Futa utafutaji' : 'Clear search'}
                </button>
              )}
            </div>

            {/* Content Grid/List */}
            {loadingCategories || loadingContent ? (
              <LoadingSpinner className="min-h-[400px]" />
            ) : content.length === 0 ? (
              <div className="bg-white/10 p-8 rounded-2xl text-center text-blue-100 shadow-lg backdrop-blur-md" data-aos="fade-up">
                <FaSearch className="text-4xl mx-auto mb-4 text-blue-300" />
                <h3 className="text-xl font-semibold mb-2">
                  {filters.language === 'sw' ? 'Hakuna maudhui yaliyopatikana' : 'No content found'}
                </h3>
                <p>
                  {filters.language === 'sw' 
                    ? 'Badilisha vichujio vyako au tafuta kitu tofauti.'
                    : 'Try adjusting your filters or search for something else.'
                  }
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-6'
              }>
                {content.map((item) => renderContentCard(item))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data with real content including your YouTube links
const getMockEducationContent = (filters) => {
  const mockContent = [
    // Nutrition Videos (Your YouTube links)
    {
      id: 'nutrition-video-1',
      title: filters.language === 'sw' ? 'Lishe Bora kwa Familia' : 'Healthy Nutrition for Families',
      description: filters.language === 'sw' 
        ? 'Jifunze mbinu za lishe bora za kufaa familia yako na kudumisha afya njema.'
        : 'Learn practical nutrition strategies to benefit your family and maintain good health.',
      type: 'video',
      category: 'nutrition',
      language: filters.language,
      mediaUrl: 'https://youtu.be/Evji_ebWZQU?si=S7z67Lq8DqIjC2mv',
      readingTime: 8,
      viewCount: 1247,
      rating: 4.7,
      publishedAt: '2024-01-15'
    },
    {
      id: 'nutrition-video-2',
      title: filters.language === 'sw' ? 'Mapishi ya Lishe Tamu' : 'Delicious Nutritious Recipes',
      description: filters.language === 'sw'
        ? 'Mapishi rahisi na ya kuvutia ya vyakula vinavyolenga kuboresha afya ya familia.'
        : 'Simple and appealing recipes for foods that aim to improve family health.',
      type: 'video',
      category: 'nutrition',
      language: filters.language,
      mediaUrl: 'https://youtu.be/BijYaGIjMVA?si=24JhtquRKeD6P8V3',
      readingTime: 6,
      viewCount: 892,
      rating: 4.5,
      publishedAt: '2024-01-10'
    },

    // Nutrition Articles
    {
      id: 'nutrition-article-1',
      title: filters.language === 'sw' ? 'Madini na Vitamini Muhimu' : 'Essential Minerals & Vitamins',
      description: filters.language === 'sw'
        ? 'Elewa umuhimu wa madini na vitamini kwenye mwili wako na vyakula vinavyoviwa.'
        : 'Understand the importance of minerals and vitamins in your body and foods that contain them.',
      type: 'article',
      category: 'nutrition',
      language: filters.language,
      content: filters.language === 'sw'
        ? `Madini na vitamini ni muhimu kwa ustawi wa mwili wako. Hizi ni baadhi ya muhimu zaidi:

• **Kalisi** - Inajenga mifupa na meno. Pata kwenye maziwa, mboga majani meusi
• **Chuma** - Inasaidia kusafirisha oksijeni damuni. Pata kwenye nyama, mboga majani
• **Vitamini A** - Inalinda macho na ngozi. Pata kwenye karoti, machungwa
• **Vitamini C** - Inaimarisha kinga ya mwili. Pata kwenye matunda ya mit citrus

Kula vyakula mbalimbali kuhakikisha unapata madini yote muhimu.`
        : `Minerals and vitamins are essential for your body's well-being. Here are some of the most important:

• **Calcium** - Builds bones and teeth. Found in milk, dark leafy greens
• **Iron** - Helps transport oxygen in blood. Found in meat, leafy vegetables  
• **Vitamin A** - Protects eyes and skin. Found in carrots, oranges
• **Vitamin C** - Boosts immune system. Found in citrus fruits

Eat a variety of foods to ensure you get all essential minerals.`,
      readingTime: 4,
      viewCount: 1563,
      rating: 4.6,
      publishedAt: '2024-01-12'
    },

    // Nutrition Quiz
    {
      id: 'nutrition-quiz-1',
      title: filters.language === 'sw' ? 'Jaribio la Maarifa ya Lishe' : 'Nutrition Knowledge Quiz',
      description: filters.language === 'sw'
        ? 'Jipime uelewa wako wa kanuni za msingi za lishe bora na afya.'
        : 'Test your understanding of basic principles of good nutrition and health.',
      type: 'quiz',
      category: 'nutrition',
      language: filters.language,
      content: JSON.stringify({
        questions: [
          {
            id: 1,
            question: filters.language === 'sw' ? 'Ni vitamini gani inayopatikana kwenye machungwa na embe?' : 'Which vitamin is found in oranges and mangoes?',
            options: filters.language === 'sw' 
              ? ['Vitamini A', 'Vitamini C', 'Vitamini D', 'Vitamini E']
              : ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
            correctAnswer: filters.language === 'sw' ? 'Vitamini C' : 'Vitamin C'
          },
          {
            id: 2,
            question: filters.language === 'sw' ? 'Chuma kinasaidia kufanya nini mwilini?' : 'What does iron help with in the body?',
            options: filters.language === 'sw'
              ? ['Kujenga mifupa', 'Kusafirisha oksijeni', 'Kulinda macho', 'Kupunguza maumivu']
              : ['Building bones', 'Transporting oxygen', 'Protecting eyes', 'Reducing pain'],
            correctAnswer: filters.language === 'sw' ? 'Kusafirisha oksijeni' : 'Transporting oxygen'
          }
        ]
      }),
      readingTime: 3,
      viewCount: 2104,
      rating: 4.8,
      publishedAt: '2024-01-08'
    },

    // Mental Health Articles
    {
      id: 'mental-article-1',
      title: filters.language === 'sw' ? 'Kudhibiti Mkazo wa Kila Siku' : 'Managing Daily Stress',
      description: filters.language === 'sw'
        ? 'Mbinu rahisi za kukabiliana na mkazo wa maisha ya kila siku na kudumisha afya ya akili.'
        : 'Simple techniques to cope with daily life stress and maintain mental health.',
      type: 'article',
      category: 'mental_wellness',
      language: filters.language,
      content: filters.language === 'sw'
        ? `Mkazo ni sehemu ya kawaida ya maisha, lakini unaweza kujifunza kuidhibiti:

**Mbinu za Kudhibiti Mkazo:**
• **Pumzika mara kwa mara** - Toa dakika chache kwa kupumzika na kupumua kwa undani
• **Zungumza na mtu** - Shiriki hisia zako na rafiki au familia
• **Fanya mazoezi** - Mwendo wa mwili husaidia kupunguza mkazo
• **Lala kwa vya kutosha** - Usingizi mzuri ni muhimu kwa afya ya akili

Kumbuka: Si uovu kuomba msaada wakati unahitaji.`
        : `Stress is a normal part of life, but you can learn to manage it:

**Stress Management Techniques:**
• **Take regular breaks** - Take few minutes to rest and breathe deeply  
• **Talk to someone** - Share your feelings with a friend or family
• **Exercise** - Physical movement helps reduce stress
• **Get enough sleep** - Good sleep is crucial for mental health

Remember: It's not wrong to ask for help when you need it.`,
      readingTime: 5,
      viewCount: 1892,
      rating: 4.7,
      publishedAt: '2024-01-14'
    },

    // Hygiene Guide
    {
      id: 'hygiene-guide-1',
      title: filters.language === 'sw' ? 'Mwongozo wa Usafi wa Mikono' : 'Hand Hygiene Guide',
      description: filters.language === 'sw'
        ? 'Jifunze hatua sahihi za kuosha mikono ili kuzuia magonjwa na kueneza kwa vimelea.'
        : 'Learn the correct steps for hand washing to prevent diseases and stop germ spread.',
      type: 'guide',
      category: 'hygiene',
      language: filters.language,
      content: filters.language === 'sw'
        ? `**Hatua 7 za Kuosha Mikono kwa Usafi:**
1. **Minyunyiza maji** - Tumia maji safi ya bomba
2. **Tia sabuni** - Tumia sabuni ya kutosha
3. **Sugua mitende** - Suguana mitende kwa pamoja
4. **Sugua vidole** - Funga vidole na kusuguana
5. **Sugua kucha** - Suguana kucha kwenye mitende
6. **Sugua shingo** - Usahau shingo za vidole
7. **Safisha mkono mzima** - Futa kwa kitambaa safi

**Wakati wa Kuosha Mikono:**
• Kabla na baada ya kula
• Baada ya kutoka msalani
• Baada ya kugusa pesa
• Baada ya kukohoa au kupiga chafya`
        : `**7 Steps for Proper Hand Washing:**
1. **Wet hands** - Use clean running water
2. **Apply soap** - Use enough soap
3. **Rub palms** - Rub palms together
4. **Rub fingers** - Interlace fingers and rub
5. **Rub nails** - Rub nails against palms  
6. **Rub backs** - Don't forget backs of fingers
7. **Rinse thoroughly** - Dry with clean cloth

**When to Wash Hands:**
• Before and after eating
• After using toilet
• After touching money
• After coughing or sneezing`,
      readingTime: 3,
      viewCount: 2341,
      rating: 4.9,
      publishedAt: '2024-01-05'
    },

    // Preventive Care Article
    {
      id: 'preventive-article-1',
      title: filters.language === 'sw' ? 'Kuzuia Magonjwa ya Kawaida' : 'Preventing Common Diseases',
      description: filters.language === 'sw'
        ? 'Kanuni za msingi za kujikinga na magonjwa yanayosambaa kwa urahisi katika jamii.'
        : 'Basic principles to protect yourself from diseases that spread easily in the community.',
      type: 'article',
      category: 'preventive_care',
      language: filters.language,
      content: filters.language === 'sw'
        ? `**Mbinu za Kuzuia Magonjwa:**

1. **Usafi wa Mikono**
   - Osha mikono mara kwa mara kwa sabuni
   - Tumia sanitizer wakati hakuna maji

2. **Chanjo**
   - Pata chanjo zote muhimu
   - Fuata ratiba ya chanjo kwa watoto

3. **Lishe Bora**
   - Kula vyakula vyenye virutubishi
   - Nywa maji ya kutosha kila siku

4. **Mazingira Safi**
   - Ondoa takataka kwa usahihi
   - Zuia kuongezeka kwa mbu na wadudu

Kuzuia ni bora kuliko tiba!`
        : `**Disease Prevention Methods:**

1. **Hand Hygiene**
   - Wash hands regularly with soap
   - Use sanitizer when no water available

2. **Vaccination**  
   - Get all important vaccinations
   - Follow vaccination schedule for children

3. **Good Nutrition**
   - Eat nutritious foods
   - Drink enough water daily

4. **Clean Environment**
   - Dispose waste properly
   - Prevent mosquito and insect breeding

Prevention is better than cure!`,
      readingTime: 4,
      viewCount: 1765,
      rating: 4.6,
      publishedAt: '2024-01-03'
    }
  ];

  // Filter content based on current filters
  let filtered = mockContent.filter(item => {
    if (filters.language && item.language !== filters.language) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Sort content
  filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return filtered;
};

export default Education;