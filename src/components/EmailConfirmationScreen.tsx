import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { spacing, fontSize, borderRadius } from '../theme/styles';

interface EmailConfirmationScreenProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({
  email,
  onBackToLogin,
}) => {
  const { theme } = useTheme();
  const { signOut } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = require('../config/supabase');
      
      if (!supabase) {
        setResendError('Supabase não configurado');
        setIsResending(false);
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend error:', error);
        setResendError(error.message || 'Erro ao reenviar email');
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      console.error('Unexpected resend error:', err);
      setResendError('Erro inesperado ao reenviar email');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = async () => {
    // Sign out to clear the unconfirmed session
    await signOut();
    onBackToLogin();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.colors.gradient} style={styles.gradient}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📧</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Verifique seu Email</Text>

          {/* Description */}
          <Text style={styles.description}>
            Enviamos um link de confirmação para:
          </Text>
          <Text style={styles.email}>{email}</Text>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionTitle}>📝 O que fazer agora:</Text>
            <Text style={styles.instruction}>1. Abra seu email</Text>
            <Text style={styles.instruction}>
              2. Procure por um email do Supabase
            </Text>
            <Text style={styles.instruction}>
              3. Clique no link de confirmação
            </Text>
            <Text style={styles.instruction}>
              4. Volte aqui e faça login
            </Text>
          </View>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              💡 <Text style={{ fontWeight: '600' }}>Dica:</Text> Verifique também
              a pasta de spam ou lixo eletrônico
            </Text>
          </View>

          {/* Resend Success */}
          {resendSuccess && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Email reenviado com sucesso!</Text>
            </View>
          )}

          {/* Resend Error */}
          {resendError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {resendError}</Text>
            </View>
          )}

          {/* Resend Button */}
          <TouchableOpacity
            onPress={handleResendEmail}
            disabled={isResending}
            style={styles.resendButtonContainer}
          >
            <View
              style={[
                styles.resendButton,
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              ]}
            >
              {isResending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.resendButtonText}>
                  🔄 Reenviar Email de Confirmação
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Back to Login Button */}
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              ← Voltar para Login
            </Text>
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Não recebeu o email? Aguarde alguns minutos ou clique em "Reenviar"
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 50,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  instructionTitle: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  infoBox: {
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  successBox: {
    width: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  successText: {
    fontSize: fontSize.sm,
    color: '#86efac',
    textAlign: 'center',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    fontSize: fontSize.sm,
    color: '#fecaca',
    textAlign: 'center',
  },
  resendButtonContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },
  resendButton: {
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#ffffff',
  },
  backButton: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: '#ffffff',
    fontWeight: '600',
  },
  helpText: {
    fontSize: fontSize.xs,
    color: '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
});

