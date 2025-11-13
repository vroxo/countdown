import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../hooks/useAuth';
import { spacing, fontSize } from '../theme/styles';

interface AuthButtonProps {
  onPress: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onPress }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'U';
    const initial = userName.charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.container}
      >
        <LinearGradient
          colors={['#8b5cf6', '#ec4899']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  loginButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#ffffff',
  },
});

