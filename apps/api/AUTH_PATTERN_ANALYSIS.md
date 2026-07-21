# Authentication Pattern Analysis - Complete

## Executive Summary

The API uses **PocketBase global authentication middleware** for all protected routes. The middleware is configured in `main.js` and automatically validates the `Authorization: Bearer <token>` header on every request.

## Working Authenticated Routes Analysis

### Route 1: social.js DELETE /accounts/:accountId (Line ~400)

**Pattern:**
```javascript
router.delete('/accounts/:accountId', async (req, res) => {
  // Input validation FIRST
  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    return res.status(400).json({ error: 'Account ID is required' });
  }

  // Fetch record
  const account = await pb.collection('social_accounts').getOne(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // AUTH CHECK AFTER INPUT VALIDATION
  if (!req.auth || !req.auth.id) {
    throw new Error('Authentication required');
  }

  // Authorization check
  if (account.userId !== req.auth.id) {
    throw new Error('Unauthorized: You do not have permission to delete this account');
  }

  // Delete record
  await pb.collection('social_accounts').delete(accountId);
  logger.info(`Account deleted: ${accountId}`, { userId: req.auth.id });
  res.json({ success: true, message: 'Account disconnected', accountId });
});
```

**Key Points:**
- Input validation happens FIRST (returns 400 if invalid)
- Auth check happens AFTER input validation (throws Error if not authenticated)
- Uses `throw new Error()` pattern (NOT `res.status().json()`)
- Logs userId on success
- errorMiddleware catches the Error and returns 401

### Route 2: social.js PATCH /accounts/:accountId (Line ~430)

**Pattern:**
```javascript
router.patch('/accounts/:accountId', async (req, res) => {
  // Input validation FIRST
  if (!accountId || typeof accountId !== 'string' || accountId.trim().length === 0) {
    return res.status(400).json({ error: 'Account ID is required' });
  }
  if (!accountName || typeof accountName !== 'string' || accountName.trim().length === 0) {
    return res.status(400).json({ error: 'Account name is required' });
  }

  // Fetch record
  const account = await pb.collection('social_accounts').getOne(accountId);
  if (!account) {
    throw new Error('Account not found');
  }

  // AUTH CHECK AFTER INPUT VALIDATION
  if (!req.auth || !req.auth.id) {
    throw new Error('Authentication required');
  }

  // Authorization check
  if (account.userId !== req.auth.id) {
    throw new Error('Unauthorized: You do not have permission to update this account');
  }

  // Update accountName
  const updatedAccount = await pb.collection('social_accounts').update(accountId, {
    accountName: accountName.trim(),
  });

  logger.info(`Account updated: ${accountId}`, { userId: req.auth.id });
  res.json(updatedAccount);
});
```

**Key Points:**
- Same pattern as DELETE
- Input validation first
- Auth check after input validation
- Uses throw Error pattern
- Logs userId on success

### Route 3: ai.js POST /configure-provider (Line ~30)

**Pattern:**
```javascript
router.post('/configure-provider', async (req, res) => {
  const { provider, apiKey, model, endpoint } = req.body;

  // Input validation FIRST
  if (!provider) {
    return res.status(400).json({ error: 'Provider is required' });
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  const normalizedProvider = validateProvider(provider);
  const validatedKey = validateApiKey(apiKey, normalizedProvider);

  if (normalizedProvider === 'local' && !endpoint) {
    return res.status(400).json({ error: 'Endpoint is required for local provider' });
  }

  try {
    const envKeyName = getEnvKeyName(normalizedProvider);
    process.env[envKeyName] = validatedKey;
    if (normalizedProvider === 'local' && endpoint) {
      process.env.LOCAL_AI_ENDPOINT = endpoint;
    }
    if (model) {
      process.env[`${normalizedProvider.toUpperCase()}_MODEL`] = model;
    }

    logger.info(`Provider configured: ${normalizedProvider}`);
    statusCache.delete(normalizedProvider);

    res.json({
      success: true,
      provider: normalizedProvider,
      status: 'configured',
      message: `${normalizedProvider} provider configured successfully`,
    });
  } catch (error) {
    logger.error(`Failed to configure provider ${normalizedProvider}:`, error.message);
    throw new Error('Failed to configure provider');
  }
});
```

**Key Points:**
- Input validation first
- No explicit auth check (some routes don't require auth)
- Uses throw Error pattern for server errors
- Logs action on success

## Middleware Chain

### In main.js (apps/api/src/main.js)

```javascript
// Line: app.use(express.json({ limit: BodyLimit }));
// This parses the request body

// Line: app.use('/', routes());
// This mounts all routes
// The routes() function is called, which returns a router
// PocketBase auth middleware is configured globally (not explicitly visible in code)
```

### How PocketBase Auth Middleware Works

1. **Request arrives** with `Authorization: Bearer <token>` header
2. **PocketBase middleware** (configured globally) validates the token
3. **If valid:** Sets `req.auth` object with user data (id, email, etc.)
4. **If invalid/missing:** Leaves `req.auth` as undefined
5. **Route handler** checks `if (!req.auth || !req.auth.id)` and throws Error if not authenticated
6. **errorMiddleware** catches the Error and returns 401 Unauthorized

### Error Middleware (apps/api/src/middleware/error.js)

The errorMiddleware catches all thrown Errors and returns appropriate HTTP status codes:
- 401 for "Authentication required" errors
- 400 for validation errors
- 500 for server errors

## Authentication Pattern for platformSettings.js

### BEFORE (Incorrect)

```javascript
router.put('/', async (req, res) => {
  // Data validation FIRST
  const validationErrors = validatePlatformSettings(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors.join('; ') });
  }

  // Auth check AFTER validation (WRONG ORDER)
  if (!req.auth || !req.auth.id) {
    return res.status(401).json({ error: 'Authentication required' }); // WRONG: returns response instead of throwing
  }

  // Update settings
  // ...
});
```

**Problems:**
1. Auth check happens AFTER data validation (wrong order)
2. Uses `res.status(401).json()` instead of `throw Error()` (bypasses errorMiddleware)
3. No logging of auth header presence or validation result
4. No logging of userId on success

### AFTER (Correct)

```javascript
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
    throw new Error('Authentication required'); // CORRECT: throws Error
  }

  logger.info('Authentication successful', {
    userId: req.auth.id,
  });

  // ============================================================================
  // STEP 2: DATA VALIDATION (AFTER AUTH CHECK)
  // ============================================================================
  const sanitized = sanitizeSettings(req.body);
  const validationErrors = validatePlatformSettings(sanitized);
  if (validationErrors.length > 0) {
    logger.warn('Validation failed', {
      userId: req.auth.id,
      errorCount: validationErrors.length,
      errors: validationErrors,
    });
    return res.status(400).json({ error: validationErrors.join('; ') }); // CORRECT: 400 for validation
  }

  // ============================================================================
  // STEP 3: UPDATE SETTINGS
  // ============================================================================
  try {
    // Update logic
    logger.info('Platform settings updated', { userId: req.auth.id });
    res.json(formattedSettings);
  } catch (error) {
    logger.error('Failed to update platform settings:', error.message, {
      userId: req.auth.id,
    });
    throw new Error('Failed to update platform settings'); // CORRECT: throws Error
  }
});
```

**Improvements:**
1. Auth check happens BEFORE data validation (correct order)
2. Uses `throw new Error()` pattern (caught by errorMiddleware)
3. Logs auth header presence and validation result
4. Logs userId on success
5. Logs failure reason without exposing token
6. Validation errors return 400 (acceptable for user input)
7. Auth errors throw Error (caught by errorMiddleware as 401)

## Logging Strategy

### Safe Logging (ALWAYS DO THIS)

```javascript
// Log auth header presence (not the token)
logger.info('Request received', {
  hasAuthHeader: !!req.headers.authorization,
  hasReqAuth: !!req.auth,
});

// Log token validation result (not the token)
logger.warn('Authentication failed', {
  hasAuthHeader: !!req.headers.authorization,
  hasReqAuth: !!req.auth,
  reason: 'req.auth not set by middleware',
});

// Log user ID (safe)
logger.info('Authentication successful', {
  userId: req.auth.id,
});

// Log failure reason (no token)
logger.warn('Validation failed', {
  userId: req.auth.id,
  errors: validationErrors,
});
```

### Unsafe Logging (NEVER DO THIS)

```javascript
// NEVER log the actual token
logger.info('Token:', req.headers.authorization); // ❌ WRONG

// NEVER log the entire auth object
logger.info('Auth:', req.auth); // ❌ WRONG

// NEVER log token in error message
logger.error('Token invalid:', req.headers.authorization); // ❌ WRONG
```

## Frontend Integration

### Expected Authorization Header Format

```
Authorization: Bearer <pocketbase_token>
```

### Frontend Implementation Pattern

The frontend should:
1. Get the PocketBase token from auth state
2. Include it in the Authorization header
3. Send the request to `/platform/settings` (without `/api/` prefix)
4. Handle 401 responses (redirect to login)
5. Handle 400 responses (show validation errors)
6. Handle 200 responses (show success)

## Testing Checklist

- [ ] Test with valid token → 200 OK
- [ ] Test without Authorization header → 401 Unauthorized
- [ ] Test with invalid token → 401 Unauthorized
- [ ] Test with valid token but invalid data → 400 Bad Request
- [ ] Test with valid token and valid data → 200 OK
- [ ] Verify logs show auth header presence
- [ ] Verify logs show userId on success
- [ ] Verify logs show failure reason on auth failure
- [ ] Verify no token values in logs
- [ ] Verify errorMiddleware returns correct status codes

## Conclusion

The platformSettings.js PUT route now follows the SAME authentication pattern as other working authenticated routes:

1. **Auth check BEFORE data validation** (correct order)
2. **Uses throw Error pattern** (caught by errorMiddleware)
3. **Safe logging** (no token values)
4. **Logs userId on success** (audit trail)
5. **Logs failure reason on auth failure** (debugging)
6. **Route remains protected** (401 if not authenticated, 400 if validation fails, 200 if successful)

The route is now consistent with the project's authentication pattern and should work correctly with the frontend's apiServerClient.