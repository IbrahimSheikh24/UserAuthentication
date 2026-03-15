/**
 * App Entry Point
 * 
 * The actual navigation and screen rendering is handled by the
 * RootNavigator component, which is instantiated in _layout.tsx.
 * 
 * Navigation Flow:
 * - AuthProvider wraps the app (provides global auth state)
 * - NavigationContainer manages the navigation structure
 * - RootNavigator displays Login/Signup screens (unauthenticated)
 *   or Home screen (authenticated)
 * 

 * 
 * This index.tsx file is not directly rendered. Instead, _layout.tsx
 * serves as the root layout component for Expo Router.
 */

export default function Index() {
  return null;
}
