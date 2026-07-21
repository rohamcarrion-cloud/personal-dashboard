# Role-Based Access Control (RBAC) Architecture

This document outlines the permission structure designed for the platform. Currently, the structure is implemented in `src/utils/permissions.js` but is **not yet enforced** to ensure uninterrupted access during the initial development phases.

## Roles

1. **Owner**: Full system access, including user management and billing.
2. **Admin**: Full access to all modules and settings, excluding user management.
3. **Editor**: Can create, edit, and publish any content across all modules. Cannot access system settings or CRM.
4. **Contributor**: Can create and edit their *own* content. Cannot publish directly (requires Editor/Admin approval).
5. **Viewer**: Read-only access to dashboards and analytics.

## Implementation Strategy (Future Phase)

When RBAC is activated:
1. **Database Level**: PocketBase API rules will be updated to check `@request.auth.role`.
2. **UI Level**: The `hasPermission(user.role, PERMISSION_NAME)` utility will be used to conditionally render buttons (e.g., hiding the "Publish" button for Contributors).
3. **Route Level**: React Router will use a `<RoleProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.EDITOR]}>` wrapper.

## Adding New Permissions

1. Define the constant in `PERMISSIONS` object in `permissions.js`.
2. Assign it to the appropriate roles in `ROLE_PERMISSIONS`.
3. Wrap UI elements: `{hasPermission(currentUser.role, PERMISSIONS.NEW_ACTION) && <Button>Action</Button>}`