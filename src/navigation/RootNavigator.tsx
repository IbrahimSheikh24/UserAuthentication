import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/auth/context/AuthContext';
import { HomeScreen } from '@/screens/HomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { styles } from '../assets/style/rootStyle';
import { colors } from '../assets/theme';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  // Show splash/loading screen ONLY during initial bootstrap on app startup
  // Once bootstrap is complete, let individual screens handle their own loading states
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
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!state.isSignedIn ? (
            <>
              <Stack.Screen name="Login" component={LoginScreenNav} />
              <Stack.Screen name="Signup" component={SignupScreenNav} />
            </>
          ) : (
            <Stack.Screen name="Home" component={HomeScreenNav} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

const LoginScreenNav: React.FC<{ navigation: any }> = ({ navigation }) => (
  <LoginScreen onNavigateToSignup={() => navigation.navigate('Signup')} />
);

const SignupScreenNav: React.FC<{ navigation: any }> = ({ navigation }) => (
  <SignupScreen onNavigateToLogin={() => navigation.navigate('Login')} />
);

const HomeScreenNav: React.FC<{ navigation: any }> = ({ navigation }) => (
  <HomeScreen onNavigateToLogin={() => {}} />
);
