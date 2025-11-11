/**
 * Fixed Health Services Routes
 * Properly handles location data and distance calculations
 * 
 * Location: server/routes/healthServices.js
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Op, fn, col, where } = require('sequelize');
const HealthService = require('../models/HealthService');
const { auth } = require('../middleware/auth');

const router = express.Router();

/* ============================================================
   GET /api/health-services
   Public – Fetch health services with filters and distance
============================================================ */
router.get(
  '/',
  [
    query('type')
      .optional({ checkFalsy: true })
      .isIn([
        'clinic',
        'pharmacy',
        'hospital',
        'emergency',
        'mental_health',
        'specialist',
      ]),
    query('lat')
      .optional({ checkFalsy: true })
      .isFloat()
      .withMessage('Latitude must be a number'),
    query('lng')
      .optional({ checkFalsy: true })
      .isFloat()
      .withMessage('Longitude must be a number'),
    query('radius')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0.1, max: 50 })
      .withMessage('Radius must be between 0.1–50 km'),
    query('emergency').optional({ checkFalsy: true }).isBoolean(),
    query('is24Hours').optional({ checkFalsy: true }).isBoolean(),
    query('page').optional({ checkFalsy: true }).isInt({ min: 1 }),
    query('limit').optional({ checkFalsy: true }).isInt({ min: 1, max: 100 }),
    query('search').optional({ checkFalsy: true }).trim().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        lat,
        lng,
        radius = 10,
        emergency,
        is24Hours,
        page = 1,
        limit = 50,
        search,
      } = req.query;

      // Build where clause
      const whereClause = { isActive: true };

      if (type) whereClause.type = type;
      if (emergency !== undefined) whereClause.isEmergency = emergency === 'true';
      if (is24Hours !== undefined) whereClause.is24Hours = is24Hours === 'true';

      // MySQL-compatible case-insensitive search
      if (search && search.trim()) {
        const lowered = search.toLowerCase().trim();
        whereClause[Op.or] = [
          where(fn('LOWER', col('name')), { [Op.like]: `%${lowered}%` }),
          where(fn('LOWER', col('description')), { [Op.like]: `%${lowered}%` }),
          where(fn('LOWER', col('address')), { [Op.like]: `%${lowered}%` }),
        ];
      }

      const offset = (page - 1) * limit;

      // Fetch all matching services
      const services = await HealthService.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit) * 2, // Fetch more to filter by distance
        offset: parseInt(offset),
        order: [
          ['rating', 'DESC'],
          ['name', 'ASC'],
        ],
      });

      let filteredServices = services.rows;

      // Calculate distances if lat/lng provided
      if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const maxRadius = parseFloat(radius);

        filteredServices = services.rows
          .map((service) => {
            // Access coordinates from location JSON field
            const serviceLat = service.location?.latitude;
            const serviceLng = service.location?.longitude;

            if (serviceLat && serviceLng) {
              const distance = calculateDistance(
                userLat,
                userLng,
                serviceLat,
                serviceLng
              );
              
              // Add distance to the service object
              service.dataValues.distance = distance;
              service.dataValues.latitude = serviceLat;
              service.dataValues.longitude = serviceLng;
            } else {
              service.dataValues.distance = null;
            }
            
            return service;
          })
          .filter((service) => {
            // Keep services within radius or those without coordinates
            return (
              service.dataValues.distance === null ||
              service.dataValues.distance <= maxRadius
            );
          })
          .sort((a, b) => {
            // Sort by distance (nulls last)
            if (a.dataValues.distance === null) return 1;
            if (b.dataValues.distance === null) return -1;
            return a.dataValues.distance - b.dataValues.distance;
          });
      } else {
        // If no coordinates provided, still expose lat/lng from location
        filteredServices = services.rows.map((service) => {
          service.dataValues.latitude = service.location?.latitude || null;
          service.dataValues.longitude = service.location?.longitude || null;
          return service;
        });
      }

      // Apply pagination limit after distance filtering
      const paginatedServices = filteredServices.slice(0, parseInt(limit));

      res.status(200).json({
        services: paginatedServices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredServices.length / limit),
          totalItems: filteredServices.length,
          itemsPerPage: parseInt(limit),
        },
        filters: {
          type: type || 'all',
          radius: parseFloat(radius),
          emergency: emergency === 'true',
          is24Hours: is24Hours === 'true',
          searchTerm: search || null,
        }
      });
    } catch (error) {
      console.error('⚠️ Error loading services:', error);
      res.status(500).json({ 
        message: 'Server error while fetching health services.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/* ============================================================
   GET /api/health-services/:id
============================================================ */
router.get('/:id', async (req, res) => {
  try {
    const service = await HealthService.findByPk(req.params.id);
    
    if (!service || !service.isActive) {
      return res.status(404).json({ message: 'Health service not found.' });
    }

    // Expose lat/lng in response
    service.dataValues.latitude = service.location?.latitude || null;
    service.dataValues.longitude = service.location?.longitude || null;

    res.status(200).json(service);
  } catch (error) {
    console.error('⚠️ Error fetching service:', error);
    res.status(500).json({ message: 'Server error while retrieving service.' });
  }
});

/* ============================================================
   POST /api/health-services (Admin Only)
============================================================ */
router.post(
  '/',
  [
    auth,
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('type')
      .isIn(['clinic', 'pharmacy', 'hospital', 'emergency', 'mental_health', 'specialist']),
    body('address').trim().isLength({ min: 5, max: 200 }),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('phone').optional().isLength({ min: 10, max: 15 }),
    body('email').optional().isEmail(),
    body('website').optional().isURL(),
    body('services').optional().isArray(),
    body('operatingHours').optional().isObject(),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Extract lat/lng and create location object
      const { latitude, longitude, ...otherData } = req.body;
      
      const serviceData = {
        ...otherData,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      };

      const service = await HealthService.create(serviceData);
      
      res.status(201).json(service);
    } catch (error) {
      console.error('⚠️ Error creating health service:', error);
      res.status(500).json({ 
        message: 'Server error while creating service.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/* ============================================================
   PUT /api/health-services/:id (Admin Only)
============================================================ */
router.put(
  '/:id',
  [
    auth,
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('type')
      .optional()
      .isIn(['clinic', 'pharmacy', 'hospital', 'emergency', 'mental_health', 'specialist']),
    body('address').optional().trim().isLength({ min: 5, max: 200 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 }),
    body('phone').optional().isLength({ min: 10, max: 15 }),
    body('email').optional().isEmail(),
    body('website').optional().isURL(),
  ],
  async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const service = await HealthService.findByPk(req.params.id);
      if (!service) {
        return res.status(404).json({ message: 'Health service not found.' });
      }

      // Handle location updates
      const { latitude, longitude, ...otherData } = req.body;
      
      const updateData = { ...otherData };
      
      if (latitude !== undefined && longitude !== undefined) {
        updateData.location = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        };
      } else if (latitude !== undefined || longitude !== undefined) {
        // Partial update - merge with existing
        updateData.location = {
          ...service.location,
          ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
          ...(longitude !== undefined && { longitude: parseFloat(longitude) })
        };
      }

      await service.update(updateData);
      res.status(200).json(service);
    } catch (error) {
      console.error('⚠️ Error updating health service:', error);
      res.status(500).json({ message: 'Server error while updating service.' });
    }
  }
);

/* ============================================================
   DELETE /api/health-services/:id (Admin Only - Soft Delete)
============================================================ */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const service = await HealthService.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Health service not found.' });
    }

    // Soft delete - just mark as inactive
    await service.update({ isActive: false });
    
    res.status(200).json({ 
      message: 'Health service deactivated successfully.',
      id: service.id
    });
  } catch (error) {
    console.error('⚠️ Error deleting health service:', error);
    res.status(500).json({ message: 'Server error while deleting health service.' });
  }
});

/* ============================================================
   Helper Function – Haversine Distance Formula
   Calculates distance in kilometers between two coordinates
============================================================ */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = router;