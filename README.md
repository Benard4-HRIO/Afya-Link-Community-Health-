# AfyaLink - Community Health Platform

AfyaLink is a comprehensive web application designed to improve community health access and education in Kitengela, Kenya. The platform provides essential health services, education, and emergency support to the local community.

## 🌟 Features

### 1. Health Service Locator
- Interactive map showing nearby clinics, pharmacies, and emergency services
- Real-time availability and service filters
- Location-based search with distance calculations
- Service ratings and reviews

### 2. Preventive Care Tracker
- Personal health dashboard for logging screenings and vaccinations
- Health reminders and notifications
- Educational tips based on health conditions
- Progress tracking and health insights

### 3. Mental Health Support Portal
- Anonymous chat with counselors and volunteers
- Self-assessment tools for mental health screening
- Directory of local mental health services
- Crisis support and resources

### 4. Health Education Hub
- Multilingual content (English and Swahili)
- Articles, videos, and interactive quizzes
- Topics: hygiene, nutrition, sexual health, mental wellness
- Gamified learning experience

### 5. Emergency Help Button
- One-click access to emergency contacts
- Ambulance service requests with location sharing
- SMS notifications via Twilio integration
- Emergency response guidelines

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Styled Components** - CSS-in-JS styling
- **Leaflet** - Interactive maps
- **React Icons** - Icon library
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Socket.io** - Real-time communication

### External Services
- **Google Maps API** - Location services
- **Twilio** - SMS notifications
- **Leaflet** - Open-source mapping

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd afyalink
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=afyalink
   DB_USER=your_username
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   createdb afyalink
   
   # The database will be automatically initialized when you start the server
   ```

5. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Low-bandwidth connections

## 🌍 Multilingual Support

- **English** - Primary language
- **Swahili** - Local language support
- Language switching in user preferences
- Localized content and interface

## 🔐 Authentication & Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User, Admin, Counselor)
- Rate limiting for API protection
- Input validation and sanitization

## 📊 Admin Dashboard

Administrators can:
- Manage health services and content
- Monitor user activity and statistics
- Moderate chat sessions
- Update educational content
- Verify service providers

## 🗺️ Health Service Locator

### Features:
- Interactive map with service markers
- Filter by service type, emergency status, hours
- Distance calculations and proximity search
- Service details and contact information
- Real-time availability status

### Service Types:
- Clinics
- Pharmacies
- Hospitals
- Emergency Services
- Mental Health Centers
- Specialist Services

## 🏥 Preventive Care Tracker

### Health Records:
- Diabetes screenings
- Hypertension monitoring
- Cholesterol checks
- Vaccination records
- General health checkups

### Features:
- Reminder system
- Health tips and recommendations
- Progress tracking
- Data visualization

## 💬 Mental Health Support

### Chat System:
- Anonymous user support
- Counselor assignment
- Priority-based queuing
- Session management
- Feedback collection

### Assessments:
- Depression screening
- Anxiety evaluation
- General mental health check
- Personalized recommendations

## 📚 Health Education Hub

### Content Types:
- Articles
- Videos
- Interactive quizzes
- Infographics
- Step-by-step guides

### Categories:
- Personal hygiene
- Nutrition and diet
- Sexual and reproductive health
- Mental wellness
- Preventive care
- Emergency response

## 🚨 Emergency Services

### Features:
- One-click emergency alerts
- Location sharing via SMS
- Ambulance service requests
- Emergency contact directory
- Response guidelines

### Emergency Contacts:
- Police: +254700000000
- Ambulance: +254700000001
- Fire Department: +254700000002
- Red Cross: +254700000003

## 🧪 Testing

### Test Accounts:
- **Admin**: admin@afyalink.com / admin123
- **User**: user@example.com / password123

## 📈 Performance Optimization

- Lazy loading for components
- Image optimization
- Caching strategies
- Database query optimization
- CDN integration ready

## 🔧 Development

### Project Structure:
```
afyalink/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/        # React contexts
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── middleware/        # Custom middleware
└── package.json          # Root package.json
```

### Available Scripts:
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run server` - Start backend only
- `npm run client` - Start frontend only

## 🌍 Deployment

### Production Environment:
1. Set up MySQL database
2. Configure environment variables
3. Install dependencies
4. Build frontend: `npm run build`
5. Start backend server
6. Configure reverse proxy (nginx)
7. Set up SSL certificates

### Docker Support:
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: info@afyalink.co.ke
- Phone: +254 700 000 000
- Address: Kitengela, Kajiado County, Kenya

## 🙏 Acknowledgments

- Kitengela community for feedback and requirements
- Local health service providers
- Open source contributors
- Healthcare professionals and volunteers

---

**AfyaLink** - Connecting communities to better health. 🏥💙





