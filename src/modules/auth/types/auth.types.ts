export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type GoogleLoginCredentials = {
  idToken: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type UserRole = "ADMIN" | "STUDENT" | "MENTOR" | "INSTRUCTOR";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
};

export type AuthSession = {
  tokens: AuthTokens;
  user: AuthUser;
  expiresAt: number;
};
