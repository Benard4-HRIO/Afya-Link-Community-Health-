import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
} from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // You can connect this to Mailchimp, Firebase, etc.
    alert(`Subscribed with: ${email}`);
    setEmail('');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaHeart className="text-white text-base" />
              </div>
              <span className="text-xl font-bold tracking-wide">AfyaLink</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Improving community health access and education in Kitengela, Kenya.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Health Services', path: '/health-services' },
                { label: 'Health Education', path: '/education' },
                { label: 'Preventive Care', path: '/preventive-care' },
                { label: 'Mental Health', path: '/mental-health' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="text-gray-300 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Health Service Locator</li>
              <li>Preventive Care Tracker</li>
              <li>Mental Health Support</li>
              <li>Health Education Hub</li>
              <li>Emergency Help</li>
            </ul>
          </div>

          {/* Contact Info */}
          <address className="not-italic">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-400" />
                <span>Kitengela, Kajiado County, Kenya</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="w-4 h-4 text-blue-400" />
                <span>+254 700 000 000</span>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="w-4 h-4 text-blue-400" />
                <a href="mailto:info@afyalink.co.ke" className="hover:text-white transition-colors">
                  info@afyalink.co.ke
                </a>
              </div>
            </div>
          </address>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2025 AfyaLink. All rights reserved.</p>
            <div className="flex gap-6 items-center">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <button onClick={toggleTheme} className="text-gray-400 hover:text-white text-sm transition-colors">
                Toggle Dark Mode
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-gray-400 hover:text-white text-sm transition-colors">
                ↑ Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
