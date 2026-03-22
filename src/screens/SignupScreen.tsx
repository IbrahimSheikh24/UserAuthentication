import React, { useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useAuthViewModel } from '@/auth/viewmodels/AuthViewModel';
import Loader from '@/components/ui/loader';
import { styles } from '../assets/style/signupScreeStyle';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const authVM = useAuthViewModel();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignup = async () => {
    // Clear all previous errors first before proceeding
    setFieldErrors({});
    authVM.clearError();

    const validation = authVM.validateSignupForm(name, email, password);

    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        errors[error.field] = error.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await authVM.signup(name, email, password);
      // Show success message
      setSignupSuccess(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      // Error is handled by the ViewModel and stored in authVM.error
    }
  };

  // Success message screen
  if (signupSuccess) {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={80} color="#34C759" />
          <Text style={styles.successTitle}>Account Created!</Text>
          <Text style={styles.successMessage}>
            Your account has been created successfully. Please log in with your credentials.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSignupSuccess(false);
            navigation.navigate('Login');
          }}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us today</Text>
        </View>

        {authVM.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{authVM.error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, fieldErrors.name && styles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor="#A9A9A9"
              value={name}
              onChangeText={setName}
              editable={!authVM.isLoading}
              autoCapitalize="words"
              returnKeyType='next'
              onSubmitEditing={()=> emailInputRef?.current?.focus()}
            />
            {fieldErrors.name && <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailInputRef}
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              editable={!authVM.isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={()=> passwordInputRef?.current?.focus()}
            />
            {fieldErrors.email && <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[styles.passwordInput, fieldErrors.password && styles.inputError]}
            >
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordField}
                placeholder="Enter your password (min 6 characters)"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!authVM.isLoading}
                onSubmitEditing={()=> handleSignup()}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={!password}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={password ? '#007AFF' : '#A9A9A9'}
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !authVM.canSignup && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={!authVM.canSignup}
        >
          {authVM.isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={authVM.isLoading}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Loading overlay */}
      {authVM.isLoading && (
        <Loader size='large' color='blue' />
      )}
    </View>
  );
};

export { SignupScreen };