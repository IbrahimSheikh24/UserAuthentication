import React, { useRef, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthViewModel } from '@/auth/viewmodels/AuthViewModel';
import Loader from '@/components/ui/loader';
import { styles } from '../assets/style/loginScreenStyle';

interface LoginScreenProps {
  onNavigateToSignup: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToSignup }) => {
  const authVM = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    const validation = authVM.validateLoginForm(email, password);

    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        errors[error.field] = error.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setFieldErrors({});
      await authVM.login(email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      // Error is handled by the ViewModel and stored in authVM.error
    }
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAwareScrollView
        style={styles.screenContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {authVM.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color="#FF3B30" />
            <Text style={styles.errorText}>{authVM.error}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              editable={!authVM.isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType='next'
              onSubmitEditing={() => passwordInputRef?.current?.focus()}
            />
            {fieldErrors.email && <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordInput, fieldErrors.password && styles.inputError]}>
              <TextInput
                ref={passwordInputRef}
                style={styles.passwordField}
                placeholder="Enter your password"
                placeholderTextColor="#A9A9A9"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!authVM.isLoading}
                returnKeyType='send'
                onSubmitEditing={handleLogin}
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
          style={[styles.button, !authVM.canLogin && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!authVM.canLogin}
        >
          {authVM.isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignup} disabled={authVM.isLoading}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {authVM.isLoading && (
        <Loader size='large' color='blue' />
      )}
    </View>
  );
};

export { LoginScreen };
