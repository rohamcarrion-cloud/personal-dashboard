# Frontend Authentication Pattern Analysis

## Executive Summary

The frontend uses **apiServerClient** as the standard HTTP client for all API requests. This client automatically handles:
1. Adding the Authorization header with the PocketBase token
2. Sending requests to the correct base URL (`/hcgi/api`)
3. Handling CORS and credentials

## Working Authenticated Modules Pattern

All working authenticated modules (PublishingQueue, AIWorkspace, Campaigns, Calendar, ContentEngine) follow this pattern:

### Pattern 1: Using apiServerClient with Authorization Header

```javascript
import { useAuth } from '../../../hooks/useAuth';
import { apiServerClient } from '../../../utils/apiServerClient';

const MyComponent = () => {
  const { user, token } = useAuth();

  const handleSave = async () => {
    try {
      // Log request details (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[MyComponent] Sending PUT request', {
          hasAuthToken: !!token,
          userId: user.id,
        });
      }

      // Send request with Authorization header
      const response = await apiServerClient.fetch('/my-endpoint', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      // Log response status
      if (process.env.NODE_ENV === 'development') {
        console.log('[MyComponent] Response received', {
          status: response.status,
          statusText: response.statusText,
        });
      }

      // Handle 401 Unauthorized (auth failure)
      if (response.status === 401) {
        console.error('[MyComponent] Authentication failed (401)');
        // Redirect to login or show error
        return;
      }

      // Handle 400 Bad Request (validation failure)
      if (response.status === 400) {
        const errorData = await response.json();
        console.error('[MyComponent] Validation failed (400)', errorData);
        // Show validation errors
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      // Success: 200 OK
      const result = await response.json();
      console.log('[MyComponent] Success', result);
    } catch (err) {
      console.error('[MyComponent] Error:', err.message);
    }
  };

  return (
    <button onClick={handleSave}>Save</button>
  );
};
```

### Key Points

1. **Import useAuth hook** - Get user and token from auth state
2. **Import apiServerClient** - Use standard HTTP client
3. **Include Authorization header** - `Authorization: Bearer ${token}`
4. **Handle 401 responses** - Auth failure (invalid/missing token)
5. **Handle 400 responses** - Validation failure (bad data)
6. **Handle 200 responses** - Success
7. **Log request/response** - Development logging only
8. **Never log token** - Only log header presence and user ID

## apiServerClient Details

### Location
`apps/web/src/utils/apiServerClient.js`

### What It Does

```javascript
// apiServerClient automatically:
// 1. Adds base URL: /hcgi/api
// 2. Handles CORS
// 3. Sends credentials (cookies)
// 4. Parses JSON responses

// Usage:
const response = await apiServerClient.fetch('/endpoint', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data),
});
```

### Base URL

- **Frontend route:** `/platform/settings`
- **apiServerClient adds:** `/hcgi/api`
- **Final URL:** `/hcgi/api/platform/settings`
- **Backend route:** `router.put('/', ...)` in `platformSettings.js`

## useAuth Hook Details

### Location
`apps/web/src/hooks/useAuth.js`

### What It Provides

```javascript
const { user, token, isAuthenticated, login, logout } = useAuth();

// user: { id, email, name, ... }
// token: PocketBase JWT token (string)
// isAuthenticated: boolean
// login: async function
// logout: async function
```

### Token Format

- **Type:** PocketBase JWT token
- **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Header format:** `Authorization: Bearer <token>`
- **Expires:** Typically 24 hours

## BrandingSettings Component Pattern

### Step 1: Import Dependencies

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { apiServerClient } from '../../../utils/apiServerClient';
```

### Step 2: Get Auth State

```javascript
const { user, token } = useAuth();
```

### Step 3: Fetch Settings (Public Endpoint)

```javascript
const fetchSettings = async () => {
  const response = await apiServerClient.fetch('/platform/settings');
  const data = await response.json();
  setSettings(data);
};
```

### Step 4: Save Settings (Protected Endpoint)

```javascript
const handleSave = async () => {
  // Verify authentication
  if (!user || !token) {
    setError('You must be logged in');
    return;
  }

  // Log request (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[BrandingSettings] Sending PUT request', {
      hasAuthToken: !!token,
      userId: user.id,
    });
  }

  // Send request with auth header
  const response = await apiServerClient.fetch('/platform/settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  // Handle responses
  if (response.status === 401) {
    setError('Authentication failed. Please log in again.');
    return;
  }

  if (response.status === 400) {
    const errorData = await response.json();
    setError(errorData.error);
    return;
  }

  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }

  // Success
  const updatedSettings = await response.json();
  setSettings(updatedSettings);
  setSuccess('Settings saved successfully!');
};
```

## Logging Strategy

### Safe Logging (ALWAYS DO THIS)

```javascript
// Log auth token presence (not the token)
if (process.env.NODE_ENV === 'development') {
  console.log('[Component] Auth status', {
    hasAuthToken: !!token,
    userId: user?.id,
  });
}

// Log response status
if (process.env.NODE_ENV === 'development') {
  console.log('[Component] Response received', {
    status: response.status,
    statusText: response.statusText,
  });
}

// Log error message (no token)
if (process.env.NODE_ENV === 'development') {
  console.error('[Component] Error:', err.message);
}
```

### Unsafe Logging (NEVER DO THIS)

```javascript
// NEVER log the actual token
console.log('Token:', token); // ❌ WRONG

// NEVER log the entire user object
console.log('User:', user); // ❌ WRONG (might contain sensitive data)

// NEVER log token in error message
console.error('Token invalid:', token); // ❌ WRONG
```

## Error Handling

### 401 Unauthorized (Authentication Failed)

**Cause:** Invalid or missing token

**Response:**
```json
{
  "error": "Authentication required"
}
```

**Frontend handling:**
```javascript
if (response.status === 401) {
  setError('Authentication failed. Please log in again.');
  // Optionally redirect to login
  // navigate('/login');
}
```

### 400 Bad Request (Validation Failed)

**Cause:** Invalid data (e.g., invalid email, missing required field)

**Response:**
```json
{
  "error": "platformName must be a non-empty string; supportEmail must be a valid email address"
}
```

**Frontend handling:**
```javascript
if (response.status === 400) {
  const errorData = await response.json();
  setError(errorData.error);
  // Show validation errors to user
}
```

### 200 OK (Success)

**Response:**
```json
{
  "platformName": "Roham Carrion",
  "platformTagline": "Social Media Management Platform",
  "primaryColor": "#3B82F6",
  // ... other fields
}
```

**Frontend handling:**
```javascript
if (response.ok) {
  const updatedSettings = await response.json();
  setSettings(updatedSettings);
  setSuccess('Settings saved successfully!');
}
```

## Testing Checklist

- [ ] Component renders without errors
- [ ] Settings load on mount (GET /platform/settings)
- [ ] Form fields populate with fetched settings
- [ ] Form changes are tracked (isDirty state)
- [ ] Save button is disabled when form is clean
- [ ] Save button is enabled when form is dirty
- [ ] Clicking Save sends PUT request with auth header
- [ ] 401 response shows auth error message
- [ ] 400 response shows validation error message
- [ ] 200 response shows success message
- [ ] Settings are updated in state after successful save
- [ ] Form is marked clean after successful save
- [ ] Reset button reverts form to last saved state
- [ ] Development logging shows request/response details
- [ ] No token values are logged

## Conclusion

The BrandingSettings component now follows the SAME authentication pattern as all working authenticated modules:

1. **Uses apiServerClient** (standard HTTP client)
2. **Includes Authorization header** with PocketBase token
3. **Handles 401 responses** (auth failure)
4. **Handles 400 responses** (validation failure)
5. **Handles 200 responses** (success)
6. **Safe logging** (no token values)
7. **Development-only logging** (wrapped in NODE_ENV check)
8. **Proper error handling** (shows user-friendly messages)

The component is now consistent with the project's authentication pattern and should work correctly with the backend's platformSettings.js route.