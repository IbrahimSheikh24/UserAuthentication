# User Authentication App - React Native

A React Native authentication application demonstrating best practices in state management, architecture patterns, and secure token handling.

> **Assignment Submission** - Complete implementation of user authentication with MVVM architecture and production-grade code quality.

---

## ⚙️ Quick Start Guide

### Prerequisites

- **Node.js** (v18+): [Download](https://nodejs.org/)
- **npm** (included with Node.js)
- **Expo CLI**: 
  ```bash
  npm install -g expo-cli
  ```
- **iOS Simulator** (Mac) OR **Android Emulator** OR **Expo Go app** on phone

### Installation & Setup

#### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/IbrahimSheikh24/UserAuthentication
cd UserAuthentication
npm install
```

#### Step 2: Create Environment File(.env)
The `.env` file stores your configuration and is NOT committed to git (for security).

```bash
# Copy the example template
cp .env.example .env

# Edit the .env file (Windows)
notepad .env

# Or (Mac/Linux)
nano .env
```

The `.env` file should contain:
```env
EXPO_PUBLIC_API_URL=https://bookmovieticket-eelf.onrender.com/api
NODE_ENV=production
```

**Different Environment Options**:
- **Production** (Default - uses deployed backend):
  ```env
  EXPO_PUBLIC_API_URL=https://bookmovieticket-eelf.onrender.com/api
  ```
- **Local Development for backend** (if you have local backend running):
  ```env
  EXPO_PUBLIC_API_URL=http://localhost:5001/api
  ```
- **Emulator/Device Testing** (replace IP with your computer's IP):
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.1.100:5001/api
  ```

#### Step 3: Start the App
```bash
npm start

# Or with cache cleared (recommended first time)
npm start -- -c
```

#### Step 4: Open in Simulator/Device

**iOS Simulator** (Mac only):
```bash
npm run ios
# Or press 'i' in terminal
```

**Android Emulator**:
```bash
npm run android
# Or press 'a' in terminal
```

**Physical Device**:
1. Download "Expo Go" app
2. Press 'e' in terminal
3. Scan QR code shown
4. App loads on your phone

### Testing the App

**Test Credentials for login**:
```
Email: test123@gmail.com
Password: 123456
```

Or create your own account by signing up.

**Test Flow**:
1. **Signup Screen**: Create account with name, email, password (6+ chars)
2. **Login Screen**: Login with email and password
3. **Home Screen**: See your information and logout
4. **Persistence**: Force close app → Reopen → Should auto-login

---

## 📝 What I Implemented

### 1. Authentication Context Setup (AuthContext)

The **AuthContext** is the core of authentication state management. It provides:

- **`signup(name, email, password)`** - Creates a new user account
- **`login(email, password)`** - Authenticates user and stores token
- **`logout()`** - Clears user data and token securely
- **`user`** state - Stores current logged-in user information

**File**: `src/auth/context/AuthContext.tsx`

**Features**:
- ✅ Global state accessible throughout the app
- ✅ Token verification on app startup (bootstrap)
- ✅ Loading states for async operations
- ✅ Error handling with user-friendly messages
- ✅ Automatic token refresh handling

---

### 2. MVVM Architecture - Clean Layer Separation

Instead of having Views directly access Context or API, I implemented **Model-View-ViewModel (MVVM)** architecture for better organization and testability.

#### Architecture Layers:

```
┌─────────────────────────────────────┐
│  VIEW LAYER (User Interface)        │
│  - LoginScreen.tsx                  │
│  - SignupScreen.tsx                 │
│  - HomeScreen.tsx                   │
│                                     │
│  Responsibilities:                  │
│  • Display UI                       │
│  • Get user input                   │
│  • Show errors & loading states     │
│  • Call ViewModel methods           │
└──────────────────┬──────────────────┘
                   │
                   ↓ (uses methods & state)
┌─────────────────────────────────────┐
│  VIEWMODEL LAYER (Business Logic)   │
│  - AuthViewModel.ts                 │
│                                     │
│  Responsibilities:                  │
│  • Form validation                  │
│  • Coordinate between View & Model  │
│  • Compute derived states           │
│  • Handle user actions              │
└──────────────────┬──────────────────┘
                   │
                   ↓ (calls model methods)
┌─────────────────────────────────────┐
│  MODEL LAYER (Data & Business)      │
│                                     │
│  AuthContext (State Management)     │
│  ├─ Manages global auth state       │
│  ├─ Handles token storage           │
│  └─ Coordinates with API            │
│                                     │
│  useAuthAPI (API Calls)             │
│  ├─ signup API call                 │
│  ├─ login API call                  │
│  ├─ logout API call                 │
│  └─ getUser API call                │
│                                     │
│  API Layer (HTTP Requests)          │
│  └─ Centralized fetch wrapper       │
└─────────────────────────────────────┘
```

#### **VIEW Layer** (Presentation)

**Files**: 
- `src/screens/LoginScreen.tsx`
- `src/screens/SignupScreen.tsx`
- `src/screens/HomeScreen.tsx`

**Responsibility**: Display UI and capture user interactions

Example (LoginScreen):
```typescript
const LoginScreen = () => {
  const authVM = useAuthViewModel();  // Get ViewModel
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // ✅ Call ViewModel method (not directly calling API or Context)
    const validation = authVM.validateLoginForm(email, password);
    
    if (validation.isValid) {
      await authVM.login(email, password);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} />
      <Button onPress={handleLogin} disabled={authVM.isLoading} />
    </View>
  );
};
```

**What the View does**:
- Renders UI components (inputs, buttons, error messages)
- Gets user input (email, password)
- Calls ViewModel methods for actions
- Reads ViewModel state for display (loading, errors, user data)
- ❌ Does NOT directly call APIs
- ❌ Does NOT directly modify global state

---

#### **VIEWMODEL Layer** (Coordination)

**File**: `src/auth/viewmodels/AuthViewModel.ts`

**Responsibility**: Bridge between View and Model layers

Example structure:
```typescript
export const useAuthViewModel = () => {
  const authContext = useAuth();  // Access Model (Context)

  // ✅ Validation logic for UI
  const validateLoginForm = (email: string, password: string) => {
    // Field validation
    if (!email) return { isValid: false, errors: [...] };
    if (!isValidEmail(email)) return { isValid: false, errors: [...] };
    if (!password) return { isValid: false, errors: [...] };
    return { isValid: true, errors: [] };
  };

  // ✅ Coordinate with Model AuthContext
  const login = async (email: string, password: string) => {
    try {
      // Call Context method (which uses API internally)
      await authContext.login(email, password);
      // View will automatically update via state change
    } catch (error) {
      // Handle error - Context updates error state
    }
  };

  return {
    // Provide to View
    login,
    validateLoginForm,
    isLoading: authContext.state.isLoading,
    error: authContext.state.error,
  };
};
```

**What the ViewModel does**:
- ✅ Validates input data
- ✅ Transforms data if needed
- ✅ Calls Model methods (AuthContext)
- ✅ Manages loading states
- ✅ Handles error scenarios
- ✅ Provides derived state to View

---

#### **MODEL Layer** (Data & State)

**Files**:
- `src/auth/context/AuthContext.tsx` - Global state management
- `src/auth/hooks/useAuthAPI.ts` - API call functions
- `src/utils/api.ts` - HTTP client

**Responsibility**: Manage data, state, and external communication

**AuthContext** (State Management): Part Of Model
```typescript
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    isSignedIn: false,
    user: null,
    error: null,
    isLoading: false,
  });

  // ✅ Business logic for login
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await useLoginAPI().login(email, password);
      setState({
        isSignedIn: true,
        user: response,
        error: null,
        isLoading: false,
      });
      await setAuthToken(response.token);  // Secure storage
    } catch (error) {
      setState({ error: error.message, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**useAuthAPI** (API Calls): Part of Model
```typescript
export const useLoginAPI = () => ({
  login: async (email: string, password: string) => {
    const response = await apiCall<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return response;  // { user, token }
  },
});
```

**API Layer** (HTTP): Part of Model
```typescript
export const apiCall = async <T,>(
  endpoint: string,
  options: RequestInit = {}
) => {
  const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

**What the Model does**:
- ✅ Manages global authentication state
- ✅ Makes API calls via fetch wrapper
- ✅ Handles token storage/retrieval
- ✅ Manages loading and error states
- ✅ Persists data to secure storage

---

### 3. Advantages of MVVM Architecture with ContextAPI

#### **Separation of Concerns**
```
View handles:      UI Rendering
ViewModel handles: Logic & Validation
Model handles:     State & Data
```

Each layer has a single responsibility, making code easier to:
- Test (mock each layer independently)
- Maintain (changes in one layer don't affect others)
- Debug (find issues in specific layers)

#### **Loose Coupling - Easy to Replace Components**

The beauty of this architecture is **modularity**. Each layer is independent:

**Example 1: Replace API Client**
```typescript
// ❌ Current: Using fetch
export const apiCall = async <T,>(endpoint: string) => {
  return fetch(`${BASE_URL}${endpoint}`).then(r => r.json());
};

// ✅ Replace with Axios (just change this file)
import axios from 'axios';
export const apiCall = async <T,>(endpoint: string) => {
  return axios.get(`${BASE_URL}${endpoint}`).then(r => r.data);
};
// Everything else works without changes!
```

**Example 2: Replace State Management**
```typescript
// ❌ Current: Using Context API
const authContext = useAuth();
authContext.login(email, password);

// ✅ Replace with Redux (just change AuthContext)
const dispatch = useDispatch();
dispatch(loginAction(email, password));
// ViewModel and View layers don't change!
```

**Example 3: Replace Data Fetching**
```typescript
// ❌ Current: Manual API hooks
export const useLoginAPI = () => ({ login: async (...) => {} });

// ✅ Replace with Tanstack Query (just change useAuthAPI)
export const useLoginAPI = () => useMutation({
  mutationFn: loginFn,
});
// Rest of the code remains the same!
```

#### **Modularity Benefits**

| Component | Can Replace With | Changes Required |
|-----------|------------------|------------------|
| **fetch** | Axios | Only `src/utils/api.ts` |
| **ContextAPI** | Redux/Zustand | Only `src/auth/context/` |
| **useAuthAPI** | TanStack Query | Only `src/auth/hooks/` |
| **State storage** | AsyncStorage ↔ SecureStore | Only `src/utils/api.ts` |

**Result**: Your entire app architecture stays the same while swapping underlying technologies!

---

### 4. React Navigation with NavigationIndependentTree

#### **The Challenge: Expo File-Based Routing vs React Navigation**

This is an **Expo project** with file-based routing (expo-router). However, the assignment specifically required implementing **React Navigation**. 

**The Problem**:
```
❌ Default Expo setup uses expo-router (automatic file-based routing)
❌ Assignment requires explicit React Navigation implementation
❌ These two systems conflict if both are active
```

**The Solution**: `NavigationIndependentTree`

From React Navigation docs, `NavigationIndependentTree` creates an **isolated navigation context** that doesn't depend on Expo's default navigation system.

#### **Why NavigationIndependentTree?**

```typescript
// ✅ This creates a standalone navigation tree
return (
  <NavigationIndependentTree>
    <NavigationContainer>
      <Stack.Navigator>
        {/* Navigation screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  </NavigationIndependentTree>
);
```

**Benefits**:
1. **Removes Expo-Router Dependency** - App doesn't rely on file-based routing
2. **Full React Navigation Control** - Explicit, programmatic navigation setup
3. **Assignment Requirement** - Demonstrates understanding of React Navigation
4. **Explicit Architecture** - Navigation structure is clear in code, not hidden in file system

#### **Navigation Structure**

**File**: `src/navigation/RootNavigator.tsx`

```typescript
export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  // Show splash screen during authentication bootstrap
  if (state.isBootstrapping) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  /* Created two satck navigator one for AuthNavigator when user is logged in and other for   Unauthnavigator when user is not logged in */

  const AuthStack = createNativeStackNavigator(); // HomeScreen
  const UnauthStack = createNativeStackNavigator(); // Login & Signup
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {state.isSignedIn ? <AuthNavigator /> : <UnauthNavigator />}
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};
```

#### **State-Driven Navigation**

The navigation flow is controlled entirely by **authentication state**:

```
Auth state changes (isSignedIn)
        ↓
RootNavigator re-renders with new state
        ↓
Stack.Navigator shows appropriate screens:
  ├─ isSignedIn = false → Show Login & Signup screens
  └─ isSignedIn = true  → Show Home screen
        ↓
No manual navigation.reset() needed
Navigation auto-sync with state
```

**Key Advantage**: Navigation state is always in sync with authentication. If token expires → state changes → navigation automatically redirects to login.

#### **How It Works**

| State | Screens Visible | User Can Do |
|-------|-----------------|-------------|
| `isBootstrapping = true` | Splash with loader | Nothing (loading auth state) |
| `isSignedIn = false` | Login + Signup | Create account or login |
| `isSignedIn = true` | Home | View profile and logout |

When `isSignedIn` changes (login/logout), React re-renders Navigator and **automatically changes screens without manual navigation calls**.

---

### 5. Backend API (Node.js + MongoDB)

I built a complete backend using **Node.js with Express and MongoDB**.

**GitHub Repository**: [BookMovieTicket - Server](https://github.com/IbrahimSheikh24/BookMovieTicket/tree/main/server)

**Deployed API Base URL**: `https://bookmovieticket-eelf.onrender.com/api`
For ex: To check all users use the below url.
https://bookmovieticket-eelf.onrender.com/api/user/getUsers

#### Backend Architecture:
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Validation**: Input validation on all endpoints

#### Database Schema (User Model):
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  createdAt: Date,
  updatedAt: Date
}
```

**Note**: No dummy users. All users are real and stored in the production MongoDB database.

---

### 6. Feature Details

#### **A. Signup Feature**

**Flow**:
```
User Input (Name, Email, Password)
        ↓
View validates locally
        ↓
ViewModel validates form
        ↓
ViewModel calls AuthContext.signup()
        ↓
AuthContext calls useSignupAPI().signup()
        ↓
API calls POST /user/signup to backend
        ↓
Backend verifies email not taken
        ↓
Backend hashes password with bcrypt
        ↓
Backend stores user in MongoDB
        ↓
Backend returns success
        ↓
ViewModel receives user data
        ↓
View shows success screen
        ↓
User navigates to Login
```

**Validation**:
- Name: Required, 2-50 characters
- Email: Valid email format, not already registered
- Password: Minimum 6 characters

**Success Response**: Success screen with message "Account created successfully"

**Error Handling**:
- Email already exists → "Email already registered"
- Network error → "Network error. Please check your connection"
- Server error → User-friendly message

---

#### **B. Login Feature with JWT Token Authentication**

**Flow**:
```
Enter Email & Password
        ↓
View validates locally
        ↓
ViewModel validates form
        ↓
ViewModel calls AuthContext.login()
        ↓
AuthContext calls useLoginAPI().login()
        ↓
API calls POST /user/login to backend
        ↓
Backend finds user by email
        ↓
Backend verifies password using bcrypt.compare()
        ↓
Backend generates JWT token (expires in 1 day for example)
        ↓
Backend returns { user, token }
        ↓
AuthContext stores token in expo-secure-store
        ↓
AuthContext updates state: { isSignedIn: true, user: {...} }
        ↓
Navigation automatically redirects to Home screen
```

**Token Management**:
- **Generated on**: Successful login
- **Expiry**:  I have set token expiry for 1day. I have added video by setting token expiry time to 2min to check session expiry.
- **Storage**: `expo-secure-store` (encrypted, not AsyncStorage)
- **Sent in**: 'jwttoken' header without Bearer.
- **Cleared on**: Logout

**Code Example**:
```typescript
const login = async (email: string, password: string) => {
  // 1. Call API
  const response = await loginAPI.login(email, password);
  // response = { user: {...}, token: "jwt..." }
  
  // 2. Store token securely
  await setAuthToken(response.token);
  
  // 3. Update global state
  setState({
    isSignedIn: true,
    user: response.user,
    error: null,
  });
};
```

**Error Handling**:
- Invalid credentials → "Invalid email or password"
- User not found → "User not found. Please signup"
- Server error → Generic error message
- Network timeout → "Connection timeout"

---

#### **C. Home Screen - Token Validation & Auto-Login**

**App Startup Flow**:
```
App starts
        ↓
RootNavigator loads
        ↓
AuthProvider triggers bootstrap
        ↓
Check if token exists in secure storage
        ↓
IF Token exists:
  ├─ Call GET /user/getUserByToken with token
  ├─ Backend validates token (not expired)
  ├─ Backend returns user data
  ├─ Update state: { isSignedIn: true, user: {...} }
  └─ Auto-redirect to Home screen
        ↓
IF Token doesn't exist OR expired:
  ├─ Clear user state
  ├─ Set isSignedIn: false
  └─ Show Login screen
```

**Home Screen Display**:
- Shows user's name automatically
- Shows user's email address
- Displays "Welcome, [Name]!"
- Shows user information in styled cards

**Once Logged In**:
- Token is automatically sent with every API request
- If token expires → User is logged out automatically
- If new login happens → Token is refreshed

**Code Example**:
```typescript
useEffect(() => {
  const bootstrap = async () => {
    // 1. Check for existing token
    const token = await getStoredAuthToken();
    
    if (!token) {
      // No token - show login
      setIsSignedIn(false);
      return;
    }
    
    // 2. Verify token by fetching user
    try {
      const user = await getUserByToken(token);
      // Token valid - auto-login
      setState({
        isSignedIn: true,
        user: user,
      });
    } catch (error) {
      // Token expired or invalid
      await setAuthToken(null);
      setIsSignedIn(false);
    }
  };
  
  bootstrap();
}, []);
```

---

#### **D. Logout Feature**

**Flow**:
```
User taps "Logout" button
        ↓
Button shows loading state
        ↓
ViewModel calls AuthContext.logout()
        ↓
AuthContext clears token from secure storage
        ↓
AuthContext clears user data: { user: null }
        ↓
AuthContext sets isSignedIn: false
        ↓
Navigation automatically redirects to Login screen
```

**Code Example**:
```typescript
const logout = async () => {
  try {
    // Clear token from secure storage
    await setAuthToken(null);
    
    // Clear user state
    setState({
      isSignedIn: false,
      user: null,
      error: null,
    });
    
    // Navigation automatically uses new state
  } catch (error) {
    setState({ error: 'Logout failed' });
  }
};
```

---

### 6. Token Storage with Expo Secure Store

**Why not AsyncStorage?**
```
❌ AsyncStorage:
  • Plain text storage
  • Anyone can read from device storage
  • Not suitable for tokens

✅ expo-secure-store:
  • Encrypted storage (iOS Keychain, Android Keystore)
  • Only your app can access
  • Professional security standard
  • Used for passwords and tokens
```

**Implementation**:
```typescript
// Store token securely
await SecureStore.setItemAsync('auth_token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('auth_token');

// Delete token
await SecureStore.deleteItemAsync('auth_token');
```

---

### 7. Production Environment

This app is **production-ready**:

✅ **No Dummy Data**: All users are real, stored in MongoDB  
✅ **Real API**: Backend deployed on Render  
✅ **Secure Storage**: Tokens encrypted with platform-specific security  
✅ **Token Expiry**: 1-day JWT tokens with server validation  
✅ **Error Handling**: Comprehensive error handling throughout  
✅ **Environment Configuration**: Different configs for dev/prod  
✅ **TypeScript**: Full type safety with strict mode  
✅ **Clean Architecture**: MVVM with clear layer separation  

---

## 📁 Project Structure

```
src/
├── assets/
│   ├── style/                  # Screen-specific styles
│   │   ├── homeScreenStyle.tsx
│   │   ├── loginScreenStyle.tsx
│   │   └── signupScreeStyle.tsx
│   └── theme/                  # Design system
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       ├── shadows.ts
│       └── borderRadius.ts
├── auth/
│   ├── context/
│   │   ├── AuthContext.tsx     # Global state & business logic
│   │   └── useAuth.ts          # Custom hook
│   ├── viewmodels/
│   │   ├── AuthViewModel.ts    # Validation & coordination
│   │   └── HomeViewModel.ts
│   ├── models/
│   │   ├── AuthState.ts        # TypeScript interfaces
│   │   └── User.ts
│   └── hooks/
│       └── useAuthAPI.ts       # API call functions
├── screens/
│   ├── LoginScreen.tsx         # View layer
│   ├── SignupScreen.tsx
│   └── HomeScreen.tsx
├── navigation/
│   └── RootNavigator.tsx       # Navigation setup
├── components/
│   └── ui/
│       └── loader.tsx
├── utils/
│   ├── api.ts                  # HTTP client & token management
│   └── logger.ts               # Logging utility
├── config/
│   └── env.ts                  # Environment configuration
└── app/
    ├── _layout.tsx             # Root with auth provider
    └── index.tsx
```

---

## 🔐 Security Features

- ✅ Token stored in encrypted secure storage
- ✅ Token sent in Authorization header
- ✅ Token verified before every protected request
- ✅ Token expiry enforcement (1 day)
- ✅ Password hashed on backend (bcrypt)
- ✅ No sensitive data logged
- ✅ Environment variables for secret URLs

---

## 📝 Available Scripts

```bash
npm start              # Start development server
npm run android        # Run on Android emulator  
npm run ios            # Run on iOS simulator
npm run web            # Run on web browser
npm run lint           # Run linter
```

---

## 🧪 Testing

**Signup Test**:
1. Enter name, email, new password
2. Tap "Sign up"
3. See success screen
4. Tap "Go to Login"

**Login Test**:
1. Enter email and password
2. Tap "Log in"
3. Auto-redirect to Home screen
4. See your information

**Auto-Login Test**:
1. Login successfully
2. Force close app
3. Reopen app
4. Notice auto-login (no need to enter credentials)

**Logout Test**:
1. Tap "Log out"
2. Auto-redirect to Login screen
3. Try reopening app → Login screen should appear

**Token Expiry Test**:
- Login
- Wait 1 day (or manually give less time to expire token on server)
- App automatically logs you out

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Secure Store](https://docs.expo.dev/modules/expo-secure-store/)
- [Backend Repository](https://github.com/IbrahimSheikh24/BookMovieTicket/tree/main/server)

---

## ✅ Assignment Requirements - All Implemented

- ✅ AuthContext with login, signup, logout, user state
- ✅ Login screen with email, password, and validation (handle error messages)
- ✅ Signup screen with name, email, password, and validation (handle error messages)
- ✅ Home screen with user info and logout button
- ✅ Persistent authentication with secure storage
- ✅ React Navigation integration to navigate between screens.
- ✅ Professional UI design
- ✅ **Bonus**: Password visibility toggle
- ✅ **Bonus**: MVVM architecture
- ✅ **Bonus**: Production environment with real backend

---

**Status**: ✅ Ready for Review  
**Last Updated**: March 2026


