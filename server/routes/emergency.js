const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ✅ SAFE Twilio initialization
let twilioClient;
let smsServiceReady = false;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    smsServiceReady = true;
    console.log('✅ Twilio SMS service initialized successfully');
  } else {
    console.log('⚠️  Twilio credentials not found - SMS functionality disabled');
  }
} catch (error) {
  console.error('❌ Twilio initialization failed:', error.message);
}

// Helper function to safely send SMS
async function sendSMS(to, message) {
  if (!smsServiceReady || !twilioClient) {
    console.log('📱 SMS service not available. Would send to:', to);
    console.log('📱 Message:', message);
    return { success: false, reason: 'SMS service not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    console.log('✅ SMS sent successfully:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return { success: false, reason: error.message };
  }
}

// Helper function to format Kenyan phone numbers
function formatKenyanPhone(phone) {
  if (!phone) return null;
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`;
  } else if (cleaned.length === 9) {
    return `+254${cleaned}`;
  } else {
    return phone; // Return as-is if format is unclear
  }
}

// Helper function to get emergency contacts based on type
function getEmergencyContacts(type) {
  const contacts = {
    medical: `• Ambulance: ${process.env.AMBULANCE_PHONE || '+254700000001'}\n• Red Cross: +254700000002\n• St. John: +254700000003`,
    police: `• Police: +254700000000\n• CID: +254700000006\n• Traffic Police: +254700000007`,
    fire: `• Fire Department: +254700000002\n• Emergency Services: +254700000008`,
    general: `• Emergency: +254700000000\n• Ambulance: +254700000001\n• Fire: +254700000002`
  };

  return contacts[type] || contacts.general;
}

// @route   POST /api/emergency/alert
// @desc    Send emergency alert
// @access  Public
router.post('/alert', [
  body('phone').isLength({ min: 9, max: 15 }).withMessage('Valid phone number required'),
  body('message').optional().trim().isLength({ max: 160 }).withMessage('Message too long'),
  body('location').optional(),
  body('emergencyType').optional().isIn(['medical', 'police', 'fire', 'general']).withMessage('Invalid emergency type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, message, location, emergencyType = 'medical' } = req.body;

    // Format phone number for Kenya
    const formattedPhone = formatKenyanPhone(phone);
    if (!formattedPhone) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Create emergency message
    let emergencyMessage = `🚨 EMERGENCY ALERT 🚨\n\n`;
    
    if (message) {
      emergencyMessage += `Message: ${message}\n\n`;
    }

    if (location) {
      if (location.latitude && location.longitude) {
        emergencyMessage += `📍 Location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\n`;
      } else if (location.address) {
        emergencyMessage += `📍 Location: ${location.address}\n\n`;
      }
    }

    emergencyMessage += `Emergency Type: ${emergencyType.toUpperCase()}\n`;
    emergencyMessage += `Time: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}\n\n`;

    // Add emergency contacts based on type
    const emergencyContacts = getEmergencyContacts(emergencyType);
    emergencyMessage += `Emergency Contacts:\n${emergencyContacts}`;

    // Send SMS
    const smsResult = await sendSMS(formattedPhone, emergencyMessage);

    res.json({ 
      message: 'Emergency alert processed successfully',
      phone: formattedPhone,
      smsSent: smsResult.success,
      timestamp: new Date().toISOString(),
      ...(smsResult.reason && { note: smsResult.reason })
    });

  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ message: 'Server error processing emergency alert' });
  }
});

// @route   POST /api/emergency/ambulance
// @desc    Request ambulance
// @access  Public
router.post('/ambulance', [
  body('phone').isLength({ min: 9, max: 15 }).withMessage('Valid phone number required'),
  body('location').optional(),
  body('patientName').optional().trim().isLength({ max: 100 }),
  body('condition').optional().trim().isLength({ max: 200 }),
  body('urgency').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, location, patientName, condition, urgency = 'medium' } = req.body;

    // Format phone number
    const formattedPhone = formatKenyanPhone(phone);
    if (!formattedPhone) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Create ambulance request message
    let ambulanceMessage = `🚑 AMBULANCE REQUEST 🚑\n\n`;
    
    if (patientName) {
      ambulanceMessage += `Patient: ${patientName}\n`;
    }
    
    if (condition) {
      ambulanceMessage += `Condition: ${condition}\n`;
    }
    
    ambulanceMessage += `Urgency: ${urgency.toUpperCase()}\n`;
    ambulanceMessage += `Time: ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}\n\n`;
    
    if (location) {
      if (location.latitude && location.longitude) {
        ambulanceMessage += `📍 Location: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\n`;
      } else if (location.address) {
        ambulanceMessage += `📍 Location: ${location.address}\n\n`;
      }
    }

    // Add ambulance contacts
    ambulanceMessage += `Ambulance Services:\n`;
    ambulanceMessage += `• Emergency: ${process.env.AMBULANCE_PHONE || '+254700000001'}\n`;
    ambulanceMessage += `• Red Cross: +254700000002\n`;
    ambulanceMessage += `• St. John Ambulance: +254700000003\n\n`;
    ambulanceMessage += `Please call the nearest service immediately!`;

    // Send SMS
    const smsResult = await sendSMS(formattedPhone, ambulanceMessage);

    res.json({ 
      message: 'Ambulance request processed successfully',
      phone: formattedPhone,
      smsSent: smsResult.success,
      timestamp: new Date().toISOString(),
      ...(smsResult.reason && { note: smsResult.reason })
    });

  } catch (error) {
    console.error('Ambulance request error:', error);
    res.status(500).json({ message: 'Server error processing ambulance request' });
  }
});

// @route   GET /api/emergency/contacts
// @desc    Get emergency contacts
// @access  Public
router.get('/contacts', async (req, res) => {
  try {
    const contacts = {
      police: {
        name: 'Police Emergency',
        phone: '+254700000000',
        description: 'For criminal activities, accidents, and security emergencies'
      },
      ambulance: {
        name: 'Ambulance Services',
        phone: '+254700000001',
        description: 'For medical emergencies requiring immediate transport'
      },
      fire: {
        name: 'Fire Department',
        phone: '+254700000002',
        description: 'For fire emergencies and rescue services'
      },
      redCross: {
        name: 'Red Cross',
        phone: '+254700000003',
        description: 'Emergency medical services and disaster response'
      },
      stJohn: {
        name: 'St. John Ambulance',
        phone: '+254700000004',
        description: 'First aid and emergency medical services'
      },
      mentalHealth: {
        name: 'Mental Health Crisis',
        phone: '+254700000005',
        description: '24/7 mental health crisis support'
      }
    };

    res.json(contacts);
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/emergency/guidelines
// @desc    Get emergency response guidelines
// @access  Public
router.get('/guidelines', async (req, res) => {
  try {
    const guidelines = {
      medical: {
        title: 'Medical Emergency Guidelines',
        steps: [
          'Stay calm and assess the situation',
          'Call emergency services immediately',
          'Provide first aid if trained',
          'Keep the patient comfortable',
          'Do not move the patient unless necessary',
          'Gather medical information if possible'
        ]
      },
      accident: {
        title: 'Accident Response Guidelines',
        steps: [
          'Ensure your own safety first',
          'Call emergency services',
          'Do not move injured persons',
          'Control traffic if possible',
          'Provide first aid if trained',
          'Stay with the injured until help arrives'
        ]
      },
      fire: {
        title: 'Fire Emergency Guidelines',
        steps: [
          'Evacuate immediately',
          'Call fire department',
          'Do not use elevators',
          'Stay low if there is smoke',
          'Feel doors before opening',
          'Meet at designated assembly point'
        ]
      }
    };

    res.json(guidelines);
  } catch (error) {
    console.error('Get guidelines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/emergency/status
// @desc    Check emergency services status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    res.json({
      smsService: smsServiceReady ? 'active' : 'inactive',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;