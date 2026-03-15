import { useAuth } from '../context/AuthContext';

export class HomeViewModel {
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;

  constructor(email: string | null, name: string | null, isLoading: boolean) {
    this.userEmail = email;
    this.userName = name;
    this.isLoading = isLoading;
  }

  getGreeting(): string {
    return `Welcome, ${this.userName}!`;
  }

  getDisplayEmail(): string {
    return this.userEmail || 'No email';
  }

  hasUser(): boolean {
    return !!this.userEmail && !!this.userName;
  }
}

export const useHomeViewModel = () => {
  const { state } = useAuth();
  const user = state.user;

  return new HomeViewModel(user?.email || null, user?.name || null, state.isLoading);
};
