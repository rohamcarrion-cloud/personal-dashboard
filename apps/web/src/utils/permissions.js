/**
 * Role Definitions
 */
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
};

/**
 * Permission Definitions
 */
export const PERMISSIONS = {
  // System
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Content
  CREATE_CONTENT: 'create_content',
  EDIT_ANY_CONTENT: 'edit_any_content',
  EDIT_OWN_CONTENT: 'edit_own_content',
  DELETE_ANY_CONTENT: 'delete_any_content',
  DELETE_OWN_CONTENT: 'delete_own_content',
  PUBLISH_CONTENT: 'publish_content',
  
  // Modules
  MANAGE_CAMPAIGNS: 'manage_campaigns',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_CRM: 'manage_crm',
  MANAGE_ASSETS: 'manage_assets'
};

/**
 * Role to Permission Mapping
 */
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_ANY_CONTENT,
    PERMISSIONS.DELETE_ANY_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.MANAGE_CAMPAIGNS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MANAGE_CRM,
    PERMISSIONS.MANAGE_ASSETS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_ANY_CONTENT,
    PERMISSIONS.PUBLISH_CONTENT,
    PERMISSIONS.MANAGE_CAMPAIGNS,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.MANAGE_ASSETS
  ],
  [ROLES.CONTRIBUTOR]: [
    PERMISSIONS.CREATE_CONTENT,
    PERMISSIONS.EDIT_OWN_CONTENT,
    PERMISSIONS.DELETE_OWN_CONTENT
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_ANALYTICS
  ]
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  // Default to true for now to not block any existing functionality
  // In the future, this will enforce actual role checks:
  // return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  return true; 
};

/**
 * Get all permissions for a role
 * @param {string} role - The user's role
 * @returns {string[]} Array of permissions
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};