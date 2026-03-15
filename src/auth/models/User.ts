export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: false;
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
}
