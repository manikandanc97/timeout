import { AssistantRoles } from '../types/assistantTypes.js';

export const normalizeRole = (role) => {
  const value = String(role ?? '').toUpperCase();
  if (value === 'REPORTING_MANAGER') return AssistantRoles.MANAGER;
  if (value === 'HR') return AssistantRoles.MANAGER;
  return value;
};

export const isAdminLikeRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === AssistantRoles.ADMIN || normalized === AssistantRoles.MANAGER;
};
