import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthViewModel } from '@/auth/viewmodels/AuthViewModel';
import { useHomeViewModel } from '@/auth/viewmodels/HomeViewModel';
import { styles } from '../assets/style/homeScreenStyle';

const HomeScreen: React.FC = () => {
  const viewModel = useHomeViewModel();
  const authVM = useAuthViewModel();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authVM.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authVM.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!viewModel.hasUser()) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found. Please log in again.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color="#007AFF" />
          </View>
          <Text style={styles.greeting}>{viewModel.getGreeting()}</Text>
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="person" size={24} color="#007AFF" />
              <Text style={styles.infoLabel}>Name</Text>
            </View>
            <Text style={styles.infoValue}>{viewModel.userName}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="email" size={24} color="#007AFF" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{viewModel.getDisplayEmail()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="logout" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export { HomeScreen };
