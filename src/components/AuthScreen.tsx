import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { spacing, fontSize, borderRadius } from '../theme/styles';

interface AuthScreenProps {
  onClose?: () => void;
  onSuccess?: (email?: string) => void;
  showSkipButton?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose, onSuccess, showSkipButton = false }) => {
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    setError('');

    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return false;
    }

    if (!password) {
      setError('Senha é obrigatória');
      return false;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (!isLogin && !name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    return true;
  };

  const getErrorMessage = (error: any): string => {
    const message = error?.message || '';
    
    // Translate common Supabase errors to Portuguese
    if (message.includes('Database error saving new user')) {
      return '⚠️ Erro de banco de dados ao criar usuário. Execute o SQL "fix-signup-database-error.sql" no Supabase SQL Editor. Veja FIX_DATABASE_ERROR_SIGNUP.md para instruções completas.';
    }
    if (message.includes('User already registered')) {
      return 'Este email já está cadastrado. Tente fazer login.';
    }
    if (message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    if (message.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (message.includes('Unable to validate email')) {
      return 'Email inválido. Verifique o formato.';
    }
    if (error?.status === 500) {
      return '⚠️ Erro no servidor. Verifique se a confirmação de email está habilitada corretamente no Supabase Dashboard (Authentication → Settings → Email Auth).';
    }
    
    return message || 'Erro desconhecido. Tente novamente.';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
          console.error('Sign in error:', signInError);
          setError(getErrorMessage(signInError));
          setIsLoading(false);
          return;
        }
      } else {
        const { error: signUpError } = await signUp(email.trim(), password, name.trim());
        if (signUpError) {
          console.error('Sign up error:', signUpError);
          setError(getErrorMessage(signUpError));
          setIsLoading(false);
          return;
        }
      }

      // Success
      setIsLoading(false);
      
      // If signup, pass email to show confirmation screen
      // If login, no email needed (user is already confirmed)
      if (!isLogin) {
        onSuccess?.(email.trim());
      } else {
        onSuccess?.();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          {showSkipButton && onClose && (
            <View style={styles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              {isLogin ? '👋 Bem-vindo!' : '🎉 Criar Conta'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Entre para sincronizar seus eventos na nuvem'
                : 'Crie uma conta e tenha seus eventos em todos os dispositivos'}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                    placeholder="Seu nome"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                  placeholder="seu@email.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.submitButtonContainer}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Toggle Mode */}
              <TouchableOpacity
                onPress={toggleMode}
                disabled={isLoading}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
                </Text>
              </TouchableOpacity>

              {/* Skip Button */}
              {showSkipButton && onClose && (
                <TouchableOpacity
                  onPress={onClose}
                  disabled={isLoading}
                  style={styles.skipButton}
                >
                  <Text style={styles.skipButtonText}>
                    Continuar sem login
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: spacing.xxl,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    color: '#fecaca',
    fontSize: fontSize.sm,
    textAlign: 'left',
    lineHeight: 20,
  },
  submitButtonContainer: {
    marginBottom: spacing.md,
  },
  submitButton: {
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  toggleButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: fontSize.md,
    color: '#ffffff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  skipButtonText: {
    fontSize: fontSize.sm,
    color: '#ffffff',
    opacity: 0.7,
  },
});

