export type AccessToken = string;

export interface AuthResponse {
  message: string;
  accessToken: AccessToken;
}

export interface RefreshResponse {
  accessToken: AccessToken;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
