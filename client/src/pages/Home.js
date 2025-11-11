import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaHeart,
  FaGraduationCap,
  FaPhone,
  FaShieldAlt,
  FaUsers,
  FaChartLine,
  FaGlobe,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion } from 'framer-motion';

const Home = () => {
  useEffect(() => {
    AOS.init({ 
      duration: 1000, 
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  const features = [
    {
      icon: FaMapMarkerAlt,
      title: 'Health Service Locator',
      description: 'Find nearby clinics, pharmacies, and emergency services with real-time availability.',
      link: '/health-services',
      color: 'from-teal-500 to-blue-500',
      gradient: 'bg-gradient-to-r from-teal-500 to-blue-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Preventive Care Tracker',
      description: 'Log health screenings, vaccinations, and receive personalized health reminders.',
      link: '/preventive-care',
      color: 'from-green-500 to-emerald-600',
      gradient: 'bg-gradient-to-r from-green-500 to-emerald-600'
    },
    {
      icon: FaHeart,
      title: 'Mental Health Support',
      description: 'Anonymous chat with counselors, self-assessment tools, and mental health resources.',
      link: '/mental-health',
      color: 'from-purple-500 to-indigo-500',
      gradient: 'bg-gradient-to-r from-purple-500 to-indigo-500'
    },
    {
      icon: FaGraduationCap,
      title: 'Health Education Hub',
      description: 'Multilingual content, videos, and quizzes on hygiene, nutrition, and wellness.',
      link: '/education',
      color: 'from-orange-400 to-red-500',
      gradient: 'bg-gradient-to-r from-orange-400 to-red-500'
    },
    {
      icon: FaPhone,
      title: 'Emergency Help',
      description: 'One-click access to emergency contacts and ambulance services with location sharing.',
      link: '/emergency',
      color: 'from-red-500 to-pink-600',
      gradient: 'bg-gradient-to-r from-red-500 to-pink-600'
    }
  ];

  const stats = [
    { number: '500+', label: 'Health Services', icon: FaMapMarkerAlt },
    { number: '1,200+', label: 'Active Users', icon: FaUsers },
    { number: '50+', label: 'Health Articles', icon: FaGraduationCap },
    { number: '24/7', label: 'Emergency Support', icon: FaPhone }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Kitengela Resident",
      content: "AfyaLink helped me find a nearby clinic when my child was sick. The service locator is amazing!",
      rating: 5
    },
    {
      name: "John K.",
      role: "Local Business Owner",
      content: "The multilingual feature makes health information accessible to everyone in our community.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Full Background */}
      <section className="relative text-white min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background with Overlay */}
        <div className="absolute inset-0">
          <motion.div
            className="w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://media.istockphoto.com/id/1327568875/photo/healthcare-business-graph-data-and-growth-insurance-healthcare-doctor-analyzing-medical-of.jpg?s=612x612&w=0&k=20&c=R4idIeTPq0f1TPSJwAq4KUeLUQg6ul8eIBSjvs9MXQk=')",
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
          />
          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-teal-700/70"></div>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-900/20 to-blue-900/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              Welcome to <span className="text-teal-300 bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent">AfyaLink</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-10 text-blue-100 font-light leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Empowering the Kitengela community through connected health access and education
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Link
                to="/health-services"
                className="group px-8 py-4 bg-teal-500 hover:bg-teal-600 rounded-full font-semibold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Find Health Services
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 rounded-full font-semibold text-white shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center p-6 group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Health Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive health solutions designed specifically for the Kitengela community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  whileHover={{ y: -8 }}
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${feature.gradient}`}></div>
                  <div className="p-8">
                    <div
                      className={`w-20 h-20 ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <Link
                      to={feature.link}
                      className="group/link flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-teal-500 text-gray-700 hover:text-white rounded-full font-semibold transition-all duration-300"
                    >
                      Learn More
                      <FaArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Community Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from members of our community who have benefited from AfyaLink
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8 shadow-lg border border-blue-100"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-20 bg-gradient-to-tr from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div data-aos="fade-right">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  About <span className="text-teal-300">AfyaLink</span>
                </h2>
                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  AfyaLink is a comprehensive health platform designed specifically for the Kitengela community. 
                  We bridge the gap between healthcare services and residents, making health information 
                  and access seamless and accessible to everyone.
                </p>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  With support for both English and Swahili, we ensure that every community member can access 
                  vital health services and education without language barriers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-teal-500 hover:bg-teal-600 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    Join Our Community
                    <FaUsers />
                  </Link>
                  <Link
                    to="/education"
                    className="px-8 py-4 border border-teal-400 text-teal-300 hover:bg-teal-400 hover:text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Learn About Health
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6" data-aos="fade-left">
                {[
                  { icon: FaUsers, title: 'Community Focused', desc: 'Built specifically for Kitengela', color: 'text-teal-400' },
                  { icon: FaGlobe, title: 'Multilingual', desc: 'English & Swahili support', color: 'text-green-400' },
                  { icon: FaChartLine, title: 'Data Driven', desc: 'Track your health progress', color: 'text-purple-400' },
                  { icon: FaPhone, title: 'Emergency Ready', desc: '24/7 support available', color: 'text-red-400' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <item.icon className={`text-3xl mb-4 ${item.color}`} />
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-blue-100 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section
        className="py-24 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 text-white relative overflow-hidden"
        data-aos="zoom-in"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of community members already using AfyaLink to improve their wellbeing and access quality healthcare services.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="group px-8 py-4 bg-white text-teal-700 hover:bg-gray-100 rounded-full font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Today
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/health-services"
              className="px-8 py-4 border-2 border-white rounded-full text-white font-semibold hover:bg-white hover:text-teal-700 transition-all duration-300 transform hover:scale-105"
            >
              Find Services Nearby
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;