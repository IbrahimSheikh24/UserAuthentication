import { User } from './User';

export interface AuthState {
  isBootstrapping: boolean;  // True during initial app startup only
  isLoading: boolean;         // True during any API call (login, signup, etc.)
  
  isSignedIn: boolean;
  user: User | null;
  error: string | null;
  successMessage: string;
}

export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;  // Clear error state
}
