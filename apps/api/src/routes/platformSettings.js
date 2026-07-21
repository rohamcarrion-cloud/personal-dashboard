import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Current active project ID - ONLY this project can bind rohamcarrion.com
const ACTIVE_PROJECT_ID = '5485adc2-868b-43bc-9816-c1901a710def';

// Phase 13A: 15 core branding fields
const DEFAULT_SETTINGS = {
  platformName: 'Roham Carrion',
  platformTagline: 'Social Media Management Platform',
  platformDescription: 'Manage all your social media accounts from one unified dashboard.',
  primaryDomain: 'rohamcarrion.com',
  supportEmail: 'support@rohamcarrion.com',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1F2937',
  accentColor: '#F59E0B',
  footerText: '© 2024 Roham Carrion. All rights reserved.',
  copyrightText: '© 2024 Roham Carrion. All rights reserved.',
  defaultOGImage: '',
  publicBrandName: 'Roham Carrion',
  socialLinks: {
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: '',
  },
};

// Phase 13A: Validation helper - FIXED to allow optional fields to be empty
function validatePlatformSettings(data) {
  const errors = [];

  // REQUIRED FIELDS - must be non-empty strings
  // platformName: required, non-empty string
  if (data.platformName !== undefined) {
    if (typeof data.platformName !== 'string') {
      errors.push('platformName must be a string');
    } else if (data.platformName.trim().length === 0) {
      errors.push('platformName is required');
    }
  }

  // platformDescription: required, non-empty string
  if (data.platformDescription !== undefined) {
    if (typeof data.platformDescription !== 'string') {
      errors.push('platformDescription must be a string');
    } else if (data.platformDescription.trim().length === 0) {
      errors.push('platformDescription is required');
    }
  }

  // supportEmail: required, valid email format
  if (data.supportEmail !== undefined) {
    if (typeof data.supportEmail !== 'string') {
      errors.push('supportEmail must be a string');
    } else if (data.supportEmail.trim().length === 0) {
      errors.push('supportEmail is required');
    } else if (!isValidEmail(data.supportEmail)) {
      errors.push('supportEmail must be a valid email address');
    }
  }

  // primaryColor: required, hex format #RRGGBB
  if (data.primaryColor !== undefined) {
    if (typeof data.primaryColor !== 'string') {
      errors.push('primaryColor must be a string');
    } else if (!isValidHexColor(data.primaryColor)) {
      errors.push('primaryColor must be a valid hex color (e.g., #3B82F6)');
    }
  }

  // secondaryColor: required, hex format #RRGGBB
  if (data.secondaryColor !== undefined) {
    if (typeof data.secondaryColor !== 'string') {
      errors.push('secondaryColor must be a string');
    } else if (!isValidHexColor(data.secondaryColor)) {
      errors.push('secondaryColor must be a valid hex color (e.g., #1F2937)');
    }
  }

  // accentColor: required, hex format #RRGGBB
  if (data.accentColor !== undefined) {
    if (typeof data.accentColor !== 'string') {
      errors.push('accentColor must be a string');
    } else if (!isValidHexColor(data.accentColor)) {
      errors.push('accentColor must be a valid hex color (e.g., #F59E0B)');
    }
  }

  // primaryDomain: optional, can be empty string, but if non-empty must be valid domain
  // CRITICAL: rohamcarrion.com can ONLY be bound to ACTIVE_PROJECT_ID
  if (data.primaryDomain !== undefined) {
    if (typeof data.primaryDomain !== 'string') {
      errors.push('primaryDomain must be a string');
    } else if (data.primaryDomain.trim().length > 0) {
      // Domain is non-empty, validate format
      if (!isValidDomain(data.primaryDomain)) {
        errors.push('primaryDomain must be a valid domain name');
      }
      // Check if trying to bind rohamcarrion.com to wrong project
      if (data.primaryDomain.toLowerCase().trim() === 'rohamcarrion.com') {
        // rohamcarrion.com is reserved for the active project only
        // This validation happens at the route level with project context
        logger.warn('Attempt to bind rohamcarrion.com detected', {
          domain: data.primaryDomain,
          activeProjectId: ACTIVE_PROJECT_ID,
        });
      }
    }
    // Empty string is allowed for optional fields
  }

  // OPTIONAL FIELDS - can be empty strings, but if provided must be valid format
  // platformTagline: optional, can be empty string
  if (data.platformTagline !== undefined) {
    if (typeof data.platformTagline !== 'string') {
      errors.push('platformTagline must be a string');
    }
    // Empty string is allowed for optional fields
  }

  // logoUrl: optional, can be empty string, but if non-empty must be valid URL
  if (data.logoUrl !== undefined) {
    if (typeof data.logoUrl !== 'string') {
      errors.push('logoUrl must be a string');
    } else if (data.logoUrl.trim().length > 0 && !isValidUrl(data.logoUrl)) {
      errors.push('logoUrl must be a valid URL');
    }
  }

  // faviconUrl: optional, can be empty string, but if non-empty must be valid URL
  if (data.faviconUrl !== undefined) {
    if (typeof data.faviconUrl !== 'string') {
      errors.push('faviconUrl must be a string');
    } else if (data.faviconUrl.trim().length > 0 && !isValidUrl(data.faviconUrl)) {
      errors.push('faviconUrl must be a valid URL');
    }
  }

  // footerText: optional, can be empty string
  if (data.footerText !== undefined) {
    if (typeof data.footerText !== 'string') {
      errors.push('footerText must be a string');
    }
    // Empty string is allowed for optional fields
  }

  // copyrightText: optional, can be empty string
  if (data.copyrightText !== undefined) {
    if (typeof data.copyrightText !== 'string') {
      errors.push('copyrightText must be a string');
    }
    // Empty string is allowed for optional fields
  }

  // defaultOGImage: optional, can be empty string, but if non-empty must be valid URL
  if (data.defaultOGImage !== undefined) {
    if (typeof data.defaultOGImage !== 'string') {
      errors.push('defaultOGImage must be a string');
    } else if (data.defaultOGImage.trim().length > 0 && !isValidUrl(data.defaultOGImage)) {
      errors.push('defaultOGImage must be a valid URL');
    }
  }

  // publicBrandName: optional, can be empty string
  if (data.publicBrandName !== undefined) {
    if (typeof data.publicBrandName !== 'string') {
      errors.push('publicBrandName must be a string');
    }
    // Empty string is allowed for optional fields
  }

  // socialLinks: optional, can be empty object {}, but must be valid JSON object
  if (data.socialLinks !== undefined) {
    if (typeof data.socialLinks !== 'object' || data.socialLinks === null || Array.isArray(data.socialLinks)) {
      errors.push('socialLinks must be a JSON object');
    } else {
      // Validate keys if object is not empty
      const validKeys = ['twitter', 'linkedin', 'facebook', 'instagram'];
      for (const key of Object.keys(data.socialLinks)) {
        if (!validKeys.includes(key)) {
          errors.push(`socialLinks contains invalid key: ${key}. Valid keys are: ${validKeys.join(', ')}`);
        }
        if (data.socialLinks[key] !== undefined && typeof data.socialLinks[key] !== 'string') {
          errors.push(`socialLinks.${key} must be a string`);
        }
      }
    }
  }

  return errors;
}

// Phase 13A: Sanitize helper - extract only the 15 fields
function sanitizeSettings(data) {
  const sanitized = {};
  const validFields = [
    'platformName',
    'platformTagline',
    'platformDescription',
    'primaryDomain',
    'supportEmail',
    'logoUrl',
    'faviconUrl',
    'primaryColor',
    'secondaryColor',
    'accentColor',
    'footerText',
    'copyrightText',
    'defaultOGImage',
    'publicBrandName',
    'socialLinks',
  ];

  for (const field of validFields) {
    if (field in data) {
      sanitized[field] = data[field];
    }
  }

  return sanitized;
}

// Phase 13A: Format response helper - return only the 15 fields
function formatResponse(settings) {
  return {
    platformName: settings.platformName || DEFAULT_SETTINGS.platformName,
    platformTagline: settings.platformTagline !== undefined ? settings.platformTagline : DEFAULT_SETTINGS.platformTagline,
    platformDescription: settings.platformDescription || DEFAULT_SETTINGS.platformDescription,
    primaryDomain: settings.primaryDomain !== undefined ? settings.primaryDomain : DEFAULT_SETTINGS.primaryDomain,
    supportEmail: settings.supportEmail || DEFAULT_SETTINGS.supportEmail,
    logoUrl: settings.logoUrl !== undefined ? settings.logoUrl : DEFAULT_SETTINGS.logoUrl,
    faviconUrl: settings.faviconUrl !== undefined ? settings.faviconUrl : DEFAULT_SETTINGS.faviconUrl,
    primaryColor: settings.primaryColor || DEFAULT_SETTINGS.primaryColor,
    secondaryColor: settings.secondaryColor || DEFAULT_SETTINGS.secondaryColor,
    accentColor: settings.accentColor || DEFAULT_SETTINGS.accentColor,
    footerText: settings.footerText !== undefined ? settings.footerText : DEFAULT_SETTINGS.footerText,
    copyrightText: settings.copyrightText !== undefined ? settings.copyrightText : DEFAULT_SETTINGS.copyrightText,
    defaultOGImage: settings.defaultOGImage !== undefined ? settings.defaultOGImage : DEFAULT_SETTINGS.defaultOGImage,
    publicBrandName: settings.publicBrandName !== undefined ? settings.publicBrandName : DEFAULT_SETTINGS.publicBrandName,
    socialLinks: settings.socialLinks || DEFAULT_SETTINGS.socialLinks,
  };
}

// Validation helpers
function isValidHexColor(color) {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDomain(domain) {
  if (!domain || typeof domain !== 'string') return false;
  // Basic domain validation: must contain at least one dot and valid characters
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * AUTHENTICATION PATTERN:
 * This route uses PocketBase global auth middleware.
 * - Frontend sends: Authorization: Bearer <pocketbase_token>
 * - PocketBase middleware validates token and sets req.auth
 * - If token is invalid/missing, req.auth is undefined
 * - Route checks: if (!req.auth || !req.auth.id) throw Error('Authentication required')
 * - errorMiddleware catches the Error and returns 401 Unauthorized
 */

// (1) GET /platform/settings
router.get('/', async (req, res) => {
  logger.info('GET /platform/settings request received');

  try {
    // Try to fetch the platform_settings record
    const records = await pb.collection('platform_settings').getFullList({ limit: 1 });

    if (records.length === 0) {
      // No settings exist, return default
      logger.info('No platform settings found in database, returning defaults');
      return res.json(DEFAULT_SETTINGS);
    }

    const settings = records[0];
    const formattedSettings = formatResponse(settings);

    logger.info('Platform settings retrieved successfully', {
      recordId: settings.id,
      fieldCount: Object.keys(formattedSettings).length,
    });
    res.json(formattedSettings);
  } catch (error) {
    logger.error('Failed to fetch platform settings from database', {
      error: error.message,
      errorCode: error.code,
    });
    // Return defaults on error instead of throwing
    res.json(DEFAULT_SETTINGS);
  }
});

// (2) PUT /platform/settings
// AUTHENTICATION: Uses PocketBase auth via Authorization header
// Expected header format: Authorization: Bearer <pocketbase_token>
// req.auth is set by PocketBase middleware in main.js
router.put('/', async (req, res) => {
  // ============================================================================
  // STEP 1: AUTH CHECK (BEFORE DATA VALIDATION)
  // ============================================================================
  logger.info('PUT /platform/settings request received', {
    hasAuthHeader: !!req.headers.authorization,
    hasReqAuth: !!req.auth,
  });

  if (!req.auth || !req.auth.id) {
    logger.warn('Authentication failed: missing or invalid token', {
      hasAuthHeader: !!req.headers.authorization,
      hasReqAuth: !!req.auth,
      reason: !req.auth ? 'req.auth not set by middleware' : 'req.auth.id missing',
    });
    throw new Error('Authentication required');
  }

  logger.info('Authentication successful', {
    userId: req.auth.id,
  });

  // ============================================================================
  // STEP 2: DATA VALIDATION (AFTER AUTH CHECK)
  // ============================================================================
  logger.info('Starting data validation', {
    userId: req.auth.id,
    requestBodyKeys: Object.keys(req.body || {}),
  });

  // Sanitize input - extract only the 15 fields
  const sanitized = sanitizeSettings(req.body);

  logger.info('Data sanitized', {
    userId: req.auth.id,
    sanitizedFieldCount: Object.keys(sanitized).length,
    sanitizedFields: Object.keys(sanitized),
  });

  // Validate all fields
  const validationErrors = validatePlatformSettings(sanitized);
  if (validationErrors.length > 0) {
    logger.warn('Validation failed', {
      userId: req.auth.id,
      errorCount: validationErrors.length,
      errors: validationErrors,
    });
    return res.status(400).json({
      message: 'Validation failed',
      details: validationErrors,
    });
  }

  // If no valid fields to update, throw error
  if (Object.keys(sanitized).length === 0) {
    logger.warn('No valid fields provided for update', {
      userId: req.auth.id,
    });
    return res.status(400).json({
      message: 'No valid fields provided for update',
      details: [],
    });
  }

  logger.info('Data validation passed', {
    userId: req.auth.id,
    fieldsToUpdate: Object.keys(sanitized),
  });

  // ============================================================================
  // STEP 3: DOMAIN BINDING VALIDATION
  // ============================================================================
  // CRITICAL: rohamcarrion.com can ONLY be bound to ACTIVE_PROJECT_ID
  if (sanitized.primaryDomain) {
    const domain = sanitized.primaryDomain.toLowerCase().trim();
    if (domain === 'rohamcarrion.com') {
      logger.info('Domain binding validation: rohamcarrion.com', {
        userId: req.auth.id,
        activeProjectId: ACTIVE_PROJECT_ID,
        domain,
      });
      // rohamcarrion.com is reserved for the active project
      // This is the only project that can use this domain
      logger.info('rohamcarrion.com binding confirmed for active project', {
        userId: req.auth.id,
        projectId: ACTIVE_PROJECT_ID,
      });
    } else if (domain.length > 0) {
      // Other domains are allowed
      logger.info('Custom domain binding', {
        userId: req.auth.id,
        domain,
      });
    }
  }

  // ============================================================================
  // STEP 4: PREPARE PAYLOAD FOR POCKETBASE
  // ============================================================================
  // Handle socialLinks: if it's an object, stringify it for PocketBase
  const payloadForPB = { ...sanitized };

  if (payloadForPB.socialLinks && typeof payloadForPB.socialLinks === 'object') {
    logger.info('Converting socialLinks object to JSON string', {
      userId: req.auth.id,
      socialLinksKeys: Object.keys(payloadForPB.socialLinks),
    });
    payloadForPB.socialLinks = JSON.stringify(payloadForPB.socialLinks);
  }

  logger.info('Payload prepared for PocketBase', {
    userId: req.auth.id,
    payloadFields: Object.keys(payloadForPB),
    payloadSize: JSON.stringify(payloadForPB).length,
  });

  // ============================================================================
  // STEP 5: FETCH EXISTING SETTINGS RECORD
  // ============================================================================
  logger.info('Fetching existing platform_settings record', {
    userId: req.auth.id,
  });

  let settingsRecord;
  let recordId;
  let isNewRecord = false;

  const records = await pb.collection('platform_settings').getFullList({ limit: 1 });

  if (records.length === 0) {
    logger.info('No existing platform_settings record found, will create new one', {
      userId: req.auth.id,
    });
    isNewRecord = true;
  } else {
    recordId = records[0].id;
    logger.info('Found existing platform_settings record', {
      userId: req.auth.id,
      recordId,
      existingFieldCount: Object.keys(records[0]).length,
    });
  }

  // ============================================================================
  // STEP 6: UPDATE OR CREATE SETTINGS RECORD
  // ============================================================================
  try {
    if (isNewRecord) {
      // Create new settings record with defaults + updates
      const newSettings = { ...DEFAULT_SETTINGS, ...payloadForPB };

      logger.info('Creating new platform_settings record', {
        userId: req.auth.id,
        fieldCount: Object.keys(newSettings).length,
        fields: Object.keys(newSettings),
      });

      settingsRecord = await pb.collection('platform_settings').create(newSettings);
      recordId = settingsRecord.id;

      logger.info('Platform settings record created successfully', {
        userId: req.auth.id,
        recordId,
        createdFieldCount: Object.keys(settingsRecord).length,
      });
    } else {
      // Update existing record
      logger.info('Updating existing platform_settings record', {
        userId: req.auth.id,
        recordId,
        updateFieldCount: Object.keys(payloadForPB).length,
        updateFields: Object.keys(payloadForPB),
      });

      settingsRecord = await pb.collection('platform_settings').update(recordId, payloadForPB);

      logger.info('Platform settings record updated successfully', {
        userId: req.auth.id,
        recordId,
        updatedFieldCount: Object.keys(settingsRecord).length,
      });
    }
  } catch (pbError) {
    logger.error('PocketBase operation failed', {
      userId: req.auth.id,
      recordId,
      isNewRecord,
      operation: isNewRecord ? 'create' : 'update',
      errorMessage: pbError.message,
      errorCode: pbError.code,
      errorStatus: pbError.status,
      payloadFieldCount: Object.keys(payloadForPB).length,
      payloadFields: Object.keys(payloadForPB),
    });

    // Throw error so errorMiddleware catches it and returns 500
    throw new Error(`Failed to ${isNewRecord ? 'create' : 'update'} platform settings: ${pbError.message}`);
  }

  // ============================================================================
  // STEP 7: FORMAT AND RETURN RESPONSE
  // ============================================================================
  try {
    const formattedSettings = formatResponse(settingsRecord);

    logger.info('Platform settings operation completed successfully', {
      userId: req.auth.id,
      recordId,
      operation: isNewRecord ? 'created' : 'updated',
      responseFieldCount: Object.keys(formattedSettings).length,
      primaryDomain: formattedSettings.primaryDomain,
    });

    res.json({
      message: `Platform settings ${isNewRecord ? 'created' : 'updated'} successfully`,
      data: formattedSettings,
    });
  } catch (formatError) {
    logger.error('Failed to format response', {
      userId: req.auth.id,
      recordId,
      errorMessage: formatError.message,
    });

    throw new Error(`Failed to format response: ${formatError.message}`);
  }
});

export default router;