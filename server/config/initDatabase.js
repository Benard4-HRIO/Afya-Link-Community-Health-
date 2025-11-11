const { sequelize, testConnection } = require('./database');
const User = require('../models/User');
const HealthService = require('../models/HealthService');
const HealthRecord = require('../models/HealthRecord');
const EducationContent = require('../models/EducationContent');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(HealthRecord, { foreignKey: 'userId', as: 'HealthRecords' });
  User.hasMany(EducationContent, { foreignKey: 'authorId', as: 'AuthoredContent' });
  User.hasMany(ChatSession, { foreignKey: 'userId', as: 'UserSessions' });
  User.hasMany(ChatSession, { foreignKey: 'counselorId', as: 'CounselorSessions' });

  // HealthRecord associations
  HealthRecord.belongsTo(User, { foreignKey: 'userId', as: 'User' });

  // EducationContent associations
  EducationContent.belongsTo(User, { foreignKey: 'authorId', as: 'Author' });

  // ChatSession associations
  ChatSession.belongsTo(User, { foreignKey: 'userId', as: 'User' });
  ChatSession.belongsTo(User, { foreignKey: 'counselorId', as: 'Counselor' });
  ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'Messages' });

  // ChatMessage associations
  ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'Session' });
  ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
};

// Initialize database
const initDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful!');

    // Define associations
    defineAssociations();

    // Sync database (update schema if changed)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully (with alter: true)');

    // Create default admin user if it doesn't exist
    await createDefaultAdmin();

    // Seed initial data
    await seedInitialData();

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0); // close gracefully
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: 'admin@afyalink.com' } });

    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@afyalink.com',
        phone: '+254700000000',
        password: 'admin123',
        role: 'admin',
        isActive: true,
      });
      console.log('👤 Default admin user created: admin@afyalink.com / admin123');
    } else {
      console.log('ℹ️ Default admin user already exists');
    }
  } catch (error) {
    console.error('⚠️ Error creating default admin:', error);
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    await seedHealthServices();
    await seedEducationContent();
    console.log('🌱 Initial data seeded successfully');
  } catch (error) {
    console.error('⚠️ Error seeding initial data:', error);
  }
};

// Seed health services
const seedHealthServices = async () => {
  const healthServices = [
    {
      name: 'Kitengela Health Center',
      type: 'clinic',
      description: 'Primary healthcare center serving Kitengela community',
      address: 'Kitengela Town Center, Kajiado County',
      location: { latitude: -1.4693, longitude: 36.9384 },
      phone: '+254700000001',
      services: ['General Consultation', 'Maternal Health', 'Child Health', 'Immunization'],
      operatingHours: {
        monday: '08:00-17:00',
        tuesday: '08:00-17:00',
        wednesday: '08:00-17:00',
        thursday: '08:00-17:00',
        friday: '08:00-17:00',
        saturday: '08:00-13:00',
        sunday: 'Closed',
      },
      isEmergency: false,
      is24Hours: false,
      rating: 4.2,
      isVerified: true,
    },
    {
      name: 'Kitengela Pharmacy',
      type: 'pharmacy',
      description: 'Full-service pharmacy with prescription and over-the-counter medications',
      address: 'Kitengela Shopping Center',
      location: { latitude: -1.4689, longitude: 36.9391 },
      phone: '+254700000002',
      services: ['Prescription Medications', 'Health Consultations', 'Medical Supplies'],
      operatingHours: {
        monday: '08:00-20:00',
        tuesday: '08:00-20:00',
        wednesday: '08:00-20:00',
        thursday: '08:00-20:00',
        friday: '08:00-20:00',
        saturday: '08:00-18:00',
        sunday: '09:00-17:00',
      },
      isEmergency: false,
      is24Hours: false,
      rating: 4.0,
      isVerified: true,
    },
    {
      name: 'Kitengela Emergency Services',
      type: 'emergency',
      description: '24/7 emergency medical services',
      address: 'Kitengela Hospital Complex',
      location: { latitude: -1.4701, longitude: 36.9378 },
      phone: '+254700000003',
      services: ['Emergency Care', 'Ambulance Services', 'Trauma Care'],
      operatingHours: {
        monday: '24/7',
        tuesday: '24/7',
        wednesday: '24/7',
        thursday: '24/7',
        friday: '24/7',
        saturday: '24/7',
        sunday: '24/7',
      },
      isEmergency: true,
      is24Hours: true,
      rating: 4.5,
      isVerified: true,
    },
  ];

  for (const service of healthServices) {
    const exists = await HealthService.findOne({ where: { name: service.name } });
    if (!exists) await HealthService.create(service);
  }
};

// Seed education content
const seedEducationContent = async () => {
  const educationContent = [
    {
      title: 'Hand Hygiene: The Foundation of Good Health',
      content: 'Proper hand washing is one of the most effective ways to prevent infections...',
      type: 'article',
      category: 'hygiene',
      language: 'en',
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: 'Usafi wa Mikono: Msingi wa Afya Njema',
      content: 'Kunawa mikono kwa njia sahihi ni moja ya njia bora zaidi za kuzuia maambukizi...',
      type: 'article',
      category: 'hygiene',
      language: 'sw',
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const content of educationContent) {
    const exists = await EducationContent.findOne({ where: { title: content.title } });
    if (!exists) await EducationContent.create(content);
  }
};

initDatabase();

module.exports = { initDatabase };




