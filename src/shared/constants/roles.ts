export const USER_ROLES = [
  "ADMIN",
  "STUDENT",
  "MENTOR",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
