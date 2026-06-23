// src/lib/access/permissions.js
import { ROLE_PERMISSIONS } from './roles';

export function hasPermission(role, action) {
    if (!role) return false;

    // Normalize role and fallback to 'user' if unknown
    const userRole = role.toLowerCase();
    const capabilities = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['user'];

    return capabilities.includes(action);
}