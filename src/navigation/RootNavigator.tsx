import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '@/auth/context/AuthContext';
import { HomeScreen } from '@/screens/HomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { styles } from '../assets/style/rootStyle';
import { colors } from '../assets/theme';

// Create separate stacks for authenticated and unauthenticated flows
const AuthStack = createNativeStackNavigator();
const UnauthStack = createNativeStackNavigator();

/**
 * Unauthenticated Stack (Login & Signup)
 * Used when user is NOT logged in
 */
const UnauthNavigator = () => (
  <UnauthStack.Navigator
    initialRouteName='Login'
    screenOptions={{
      headerShown: false,
      animation: 'none',
    }}
  >
    <UnauthStack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
    <UnauthStack.Screen 
      name="Signup" 
      component={SignupScreen}
      options={{
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
  </UnauthStack.Navigator>
);

/**
 * Authenticated Stack (Home)
 * Used when user IS logged in
 */
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
  </AuthStack.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  // Show splash/loading screen ONLY during initial bootstrap on app startup
  if (state.isBootstrapping) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {state.isSignedIn ? <AuthNavigator /> : <UnauthNavigator />}
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};
