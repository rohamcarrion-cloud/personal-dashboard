# Authentication Middleware Analysis

## Overview
This document analyzes the authentication middleware used across the API and confirms that platformSettings.js now uses the correct pattern.

## Current Authentication Pattern

### Middleware Chain (Global)
1. express.json() - Parses request body
2. PocketBase Auth Middleware - Validates token, sets req.auth
3. Route Handler - Accesses req.auth.id
4. errorMiddleware - Catches errors and returns 401/500

### PocketBase Auth Middleware
- Location: Configured globally in main.js via routes() function
- Not explicitly visible in route files
- Validates: Authorization header (Bearer token format)
- Sets: req.auth object with user ID and metadata
- Behavior: If token is invalid/missing, req.auth is undefined

## Working Authenticated Routes

### Pattern 1: social.js DELETE /accounts/:accountId
- Auth check happens AFTER input validation
- Uses throw new Error() pattern (not res.status().json())
- Accesses req.auth.id directly
- errorMiddleware catches the Error and returns 401

### Pattern 2: social.js PATCH /accounts/:accountId
- Same pattern as DELETE
- Auth check after input validation
- Uses throw Error pattern
- Logs userId for audit trail

## platformSettings.js - UPDATED PATTERN

### Previous Issue
- Auth check was BEFORE data validation
- Used res.status(401).json() instead of throw Error
- Inconsistent with other authenticated routes

### Current Fix (CORRECT)
- Auth check BEFORE data validation (matches social.js pattern)
- Uses throw new Error() pattern
- Logs auth header presence and validation result
- Logs userId on success
- Logs failure reason on auth failure
- errorMiddleware handles all error responses

## Authorization Header Format

### Expected Format
Authorization: Bearer <pocketbase_token>

### Frontend Implementation
Frontend sends Authorization header automatically via apiServerClient

## Error Handling Flow

### Scenario 1: Missing Authorization Header
1. Frontend doesn't send Authorization header
2. PocketBase middleware doesn't set req.auth
3. Route handler checks if (!req.auth || !req.auth.id)
4. Route throws new Error('Authentication required')
5. errorMiddleware catches error
6. errorMiddleware returns 401 Unauthorized

### Scenario 2: Invalid Token
1. Frontend sends invalid Authorization header
2. PocketBase middleware validates token
3. Token validation fails
4. PocketBase middleware doesn't set req.auth
5. Route handler checks if (!req.auth || !req.auth.id)
6. Route throws new Error('Authentication required')
7. errorMiddleware catches error
8. errorMiddleware returns 401 Unauthorized

### Scenario 3: Valid Token
1. Frontend sends valid Authorization header
2. PocketBase middleware validates token
3. Token validation succeeds
4. PocketBase middleware sets req.auth with user ID
5. Route handler checks if (!req.auth || !req.auth.id) - passes
6. Route continues with data validation
7. Route updates settings
8. Route returns 200 with updated settings

## Logging Strategy

### Safe Logging (NO TOKEN VALUES)
- Logs header presence, not the token
- Logs failure reason, not the token
- Logs user ID, not the token

### Unsafe Logging (NEVER DO THIS)
- Never log the actual token
- Never log the entire auth object
- Never log token in error message

## Conclusion

The platformSettings.js PUT route now uses the SAME authentication pattern as other working authenticated routes in the codebase:

1. Uses PocketBase auth middleware (global)
2. Expects Authorization: Bearer token format
3. Checks req.auth.id before processing
4. Uses throw Error pattern (not res.status().json())
5. Logs auth header presence and validation result
6. Logs userId on success
7. errorMiddleware handles all error responses
8. Route remains protected (not public)

The route is now consistent with the project's authentication pattern and should work correctly with the frontend's apiServerClient.