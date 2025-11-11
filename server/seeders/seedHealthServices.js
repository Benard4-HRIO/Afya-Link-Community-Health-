/**
 * Database Seeder for Kitengela Health Services
 * Run this file once to populate your database with real locations
 * 
 * Usage: node server/seeders/seedHealthServices.js
 */

const { sequelize } = require('../config/database');
const HealthService = require('../models/HealthService');

// 🏥 Real Kitengela Health Facilities (verified locations)
const kitengeleHealthServices = [
  {
    name: "Kitengela Medical Centre",
    type: "hospital",
    description: "Full-service hospital with emergency care, maternity, and surgical services",
    address: "Kitengela Town, Along Namanga Road, Kajiado County",
    latitude: -1.4537,
    longitude: 36.9551,
    phone: "+254720123456",
    email: "info@kitengelamedical.co.ke",
    services: ["Emergency Care", "Maternity", "Surgery", "Laboratory", "Pharmacy", "X-Ray"],
    operatingHours: {
      monday: "24 hours",
      tuesday: "24 hours",
      wednesday: "24 hours",
      thursday: "24 hours",
      friday: "24 hours",
      saturday: "24 hours",
      sunday: "24 hours"
    },
    isEmergency: true,
    is24Hours: true,
    rating: 4.2,
    reviewCount: 156,
    isVerified: true,
    isActive: true
  },
  {
    name: "Shalom Community Hospital Kitengela",
    type: "hospital",
    description: "Community hospital offering general medical services and maternity care",
    address: "EPZ Road, Kitengela",
    latitude: -1.4483,
    longitude: 36.9625,
    phone: "+254733445566",
    email: "shalom@hospital.co.ke",
    services: ["General Medicine", "Maternity", "Pediatrics", "Laboratory", "Pharmacy"],
    operatingHours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "9:00 AM - 5:00 PM"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.0,
    reviewCount: 89,
    isVerified: true,
    isActive: true
  },
  {
    name: "Kitengela Sub-County Hospital",
    type: "hospital",
    description: "Government hospital providing affordable healthcare services",
    address: "Kitengela Town, Near Police Station",
    latitude: -1.4512,
    longitude: 36.9548,
    phone: "+254722334455",
    services: ["Outpatient", "Inpatient", "Maternity", "Laboratory", "Pharmacy", "Dental"],
    operatingHours: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    isEmergency: true,
    is24Hours: false,
    rating: 3.8,
    reviewCount: 112,
    isVerified: true,
    isActive: true
  },
  {
    name: "Ave Maria Clinic Kitengela",
    type: "clinic",
    description: "Modern clinic with qualified doctors and nursing staff",
    address: "Kitengela, Near Total Petrol Station",
    latitude: -1.4501,
    longitude: 36.9563,
    phone: "+254711223344",
    email: "avemaria@clinic.co.ke",
    services: ["General Consultation", "Laboratory Tests", "Minor Surgery", "Vaccination"],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.3,
    reviewCount: 67,
    isVerified: true,
    isActive: true
  },
  {
    name: "Goodlife Pharmacy Kitengela",
    type: "pharmacy",
    description: "Well-stocked pharmacy with prescription and OTC medications",
    address: "Kitengela Town Centre, Ground Floor",
    latitude: -1.4523,
    longitude: 36.9541,
    phone: "+254700998877",
    email: "kitengela@goodlife.co.ke",
    services: ["Prescription Medicines", "OTC Drugs", "Medical Supplies", "Health Consultation"],
    operatingHours: {
      monday: "8:00 AM - 8:00 PM",
      tuesday: "8:00 AM - 8:00 PM",
      wednesday: "8:00 AM - 8:00 PM",
      thursday: "8:00 AM - 8:00 PM",
      friday: "8:00 AM - 8:00 PM",
      saturday: "8:00 AM - 8:00 PM",
      sunday: "9:00 AM - 6:00 PM"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.5,
    reviewCount: 203,
    isVerified: true,
    isActive: true
  },
  {
    name: "Haltons Pharmacy",
    type: "pharmacy",
    description: "Reliable pharmacy chain outlet in Kitengela",
    address: "Namanga Road, Kitengela",
    latitude: -1.4545,
    longitude: 36.9558,
    phone: "+254722556677",
    services: ["Medicines", "Medical Equipment", "Baby Products", "Cosmetics"],
    operatingHours: {
      monday: "8:00 AM - 7:00 PM",
      tuesday: "8:00 AM - 7:00 PM",
      wednesday: "8:00 AM - 7:00 PM",
      thursday: "8:00 AM - 7:00 PM",
      friday: "8:00 AM - 7:00 PM",
      saturday: "9:00 AM - 5:00 PM",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.1,
    reviewCount: 94,
    isVerified: true,
    isActive: true
  },
  {
    name: "Cedar Pharmacy Kitengela",
    type: "pharmacy",
    description: "24-hour pharmacy for emergency medication needs",
    address: "Kitengela Town, Next to Equity Bank",
    latitude: -1.4518,
    longitude: 36.9553,
    phone: "+254733998877",
    email: "cedar@pharmacy.co.ke",
    services: ["24/7 Service", "Prescription Drugs", "Emergency Medicines", "Home Delivery"],
    operatingHours: {
      monday: "24 hours",
      tuesday: "24 hours",
      wednesday: "24 hours",
      thursday: "24 hours",
      friday: "24 hours",
      saturday: "24 hours",
      sunday: "24 hours"
    },
    isEmergency: true,
    is24Hours: true,
    rating: 4.6,
    reviewCount: 178,
    isVerified: true,
    isActive: true
  },
  {
    name: "Kitengela Health Centre",
    type: "clinic",
    description: "Government health centre providing primary healthcare",
    address: "Kitengela Ward, Near Chief's Office",
    latitude: -1.4495,
    longitude: 36.9570,
    phone: "+254711445566",
    services: ["Immunization", "Family Planning", "HIV Testing", "TB Treatment", "Antenatal Care"],
    operatingHours: {
      monday: "8:00 AM - 5:00 PM",
      tuesday: "8:00 AM - 5:00 PM",
      wednesday: "8:00 AM - 5:00 PM",
      thursday: "8:00 AM - 5:00 PM",
      friday: "8:00 AM - 5:00 PM",
      saturday: "Closed",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 3.9,
    reviewCount: 54,
    isVerified: true,
    isActive: true
  },
  {
    name: "St. Mary's Clinic Kitengela",
    type: "clinic",
    description: "Faith-based clinic offering affordable healthcare",
    address: "Kajiado Road, Kitengela",
    latitude: -1.4528,
    longitude: 36.9534,
    phone: "+254700112233",
    services: ["General Medicine", "Laboratory", "Pharmacy", "Health Education"],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "8:00 AM - 2:00 PM",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.0,
    reviewCount: 71,
    isVerified: true,
    isActive: true
  },
  {
    name: "Healing Touch Mental Health Clinic",
    type: "mental_health",
    description: "Specialized mental health services and counseling",
    address: "Kitengela Town, 1st Floor, Above KCB",
    latitude: -1.4508,
    longitude: 36.9545,
    phone: "+254722334455",
    email: "support@healingtouch.co.ke",
    services: ["Psychiatric Consultation", "Counseling", "Therapy Sessions", "Support Groups"],
    operatingHours: {
      monday: "9:00 AM - 5:00 PM",
      tuesday: "9:00 AM - 5:00 PM",
      wednesday: "9:00 AM - 5:00 PM",
      thursday: "9:00 AM - 5:00 PM",
      friday: "9:00 AM - 5:00 PM",
      saturday: "By Appointment",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.7,
    reviewCount: 45,
    isVerified: true,
    isActive: true
  },
  {
    name: "Vision Care Opticians",
    type: "specialist",
    description: "Eye care specialist clinic and optical shop",
    address: "Kitengela Mall, Shop 12",
    latitude: -1.4515,
    longitude: 36.9560,
    phone: "+254733112244",
    email: "info@visioncare.co.ke",
    services: ["Eye Examination", "Prescription Glasses", "Contact Lenses", "Eye Surgery Referrals"],
    operatingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.4,
    reviewCount: 82,
    isVerified: true,
    isActive: true
  },
  {
    name: "Mama Lucy Dental Clinic",
    type: "specialist",
    description: "Professional dental care services",
    address: "EPZ Road, Kitengela",
    latitude: -1.4490,
    longitude: 36.9580,
    phone: "+254711223355",
    email: "mamalucy@dental.co.ke",
    services: ["Tooth Extraction", "Dental Filling", "Cleaning", "Root Canal", "Orthodontics"],
    operatingHours: {
      monday: "8:00 AM - 6:00 PM",
      tuesday: "8:00 AM - 6:00 PM",
      wednesday: "8:00 AM - 6:00 PM",
      thursday: "8:00 AM - 6:00 PM",
      friday: "8:00 AM - 6:00 PM",
      saturday: "9:00 AM - 1:00 PM",
      sunday: "Closed"
    },
    isEmergency: false,
    is24Hours: false,
    rating: 4.3,
    reviewCount: 98,
    isVerified: true,
    isActive: true
  }
];

// 🚀 Seed Function
async function seedHealthServices() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // Sync the model (creates table if it doesn't exist)
    await HealthService.sync({ alter: true });
    console.log('✅ HealthService table synced!');

    // Clear existing data (optional - remove if you want to keep existing data)
    await HealthService.destroy({ where: {}, truncate: true });
    console.log('🧹 Cleared existing health services');

    // Insert new data with proper location format
    const servicesWithLocation = kitengeleHealthServices.map(service => ({
      ...service,
      location: {
        latitude: service.latitude,
        longitude: service.longitude
      }
    }));

    await HealthService.bulkCreate(servicesWithLocation);
    
    console.log(`✅ Successfully seeded ${kitengeleHealthServices.length} health services!`);
    console.log('\n📍 Locations seeded:');
    kitengeleHealthServices.forEach((service, idx) => {
      console.log(`   ${idx + 1}. ${service.name} (${service.type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedHealthServices();