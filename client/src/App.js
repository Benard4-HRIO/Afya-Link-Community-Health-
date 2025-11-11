import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import HealthServices from './pages/HealthServices';
import PreventiveCare from './pages/PreventiveCare';
import MentalHealth from './pages/MentalHealth';
import Education from './pages/Education';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ContentDetail from './pages/ContentDetail';
import QuizPage from './pages/QuizPage';

// ✅ Import your MapPage
import MapPage from './pages/MapPage';

// ✅ Import your new ForgotPassword & ResetPassword pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
  }, []);

  if (loading) return <LoadingSpinner />;

  const pageVariants = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
          >
            <Routes location={location} key={location.pathname}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/health-services" element={<HealthServices />} />
              <Route path="/education" element={<Education />} />
              <Route path="/emergency" element={<Emergency />} />

              {/* ✅ Forgot & Reset Password routes */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* ✅ Map route */}
              <Route path="/map" element={<MapPage />} />

              {/* Content & quiz routes */}
              <Route path="/education/content/:id" element={<ContentDetail />} />
              <Route path="/education/quiz/:id" element={<QuizPage />} />

              {/* Protected routes */}
              <Route
                path="/preventive-care"
                element={
                  <ProtectedRoute>
                    <PreventiveCare />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mental-health"
                element={
                  <ProtectedRoute>
                    <MentalHealth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
