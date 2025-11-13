import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { spacing, fontSize } from '../theme/styles';

export const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  const { forceSyncNow } = useEvents();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    const performLogout = async () => {
      setIsLoggingOut(true);
      try {
        // Force sync events before logout to prevent data loss
        await forceSyncNow();
        await signOut();
      } catch (error) {
        console.error('Error during logout:', error);
        await signOut(); // Sign out anyway
      } finally {
        setIsLoggingOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Deseja realmente sair?');
      if (confirmed) {
        await performLogout();
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
            onPress: performLogout,
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      activeOpacity={0.8}
      style={styles.container}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>🚪 Sair</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#ffffff',
  },
});

