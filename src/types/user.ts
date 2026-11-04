export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  currency: string;
  monthlyBudget: number | null;
}

export interface UserProfile extends UserSettings {
  displayName: string | null;
  email: string | null;
  createdAt: string;
}

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends EmailCredentials {
  displayName: string;
}
