import type { UserProfile } from "./auth";

export interface SessionState {
  accessToken: string;
  profile: UserProfile;
}
