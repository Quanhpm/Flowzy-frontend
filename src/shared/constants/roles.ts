export const USER_ROLES = [
  "student",
  "instructor",
  "mentor",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
