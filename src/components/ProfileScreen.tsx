import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { spacing, fontSize, borderRadius } from '../theme/styles';

interface ProfileScreenProps {
  onClose: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onClose }) => {
  const { user, signOut, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Deseja realmente sair?');
      if (confirmed) {
        signOut();
        onClose();
      }
    } else {
      Alert.alert(
        'Sair',
        'Deseja realmente sair da sua conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              signOut();
              onClose();
            },
          },
        ]
      );
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
  const userEmail = user.email || '';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8b5cf6', '#ec4899']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>

            {/* Info Cards */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>☁️ Sincronização</Text>
                <Text style={styles.infoValue}>Ativa</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>📱 Dispositivos</Text>
                <Text style={styles.infoValue}>Todos sincronizados</Text>
              </View>
            </View>

            {/* Info Text */}
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                ✅ Seus eventos estão sendo sincronizados automaticamente na nuvem
              </Text>
              <Text style={styles.infoText}>
                ✅ Acesse seus eventos de qualquer dispositivo
              </Text>
              <Text style={styles.infoText}>
                ✅ Seus dados estão seguros e protegidos
              </Text>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutButtonContainer}
            >
              <View style={[styles.signOutButton, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.signOutButtonText}>
                  🚪 Sair da Conta
                </Text>
              </View>
            </TouchableOpacity>

            {/* Version */}
            <Text style={styles.versionText}>Countdown App v1.0.0</Text>
          </View>
        </ScrollView>
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
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: spacing.xl,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    paddingTop: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: '#ffffff',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: 0.9,
  },
  infoTextContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  signOutButtonContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  signOutButton: {
    height: 50,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  versionText: {
    fontSize: fontSize.xs,
    color: '#ffffff',
    opacity: 0.5,
    marginTop: spacing.lg,
  },
});

