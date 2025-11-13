import React, { useState } from 'react';
import { StyleSheet, Text, View, StatusBar, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { EventsProvider } from './src/contexts/EventsContext';
import { useTheme } from './src/hooks/useTheme';
import { useAuth } from './src/hooks/useAuth';
import { useEvents } from './src/hooks/useEvents';
import { spacing, fontSize } from './src/theme/styles';
import { APP_CONFIG } from './src/utils/constants';
import { ThemeToggle } from './src/components/ThemeToggle';
import { AuthButton } from './src/components/AuthButton';
import { LogoutButton } from './src/components/LogoutButton';
import { EventListWithTabs } from './src/components/EventListWithTabs';
import { FAB } from './src/components/FAB';
import { AddEditEventModal } from './src/components/AddEditEventModal';
import { AuthScreen } from './src/components/AuthScreen';
import { ProfileScreen } from './src/components/ProfileScreen';
import { EmailConfirmationScreen } from './src/components/EmailConfirmationScreen';
import { Event } from './src/types';

function AppContent() {
  const { theme, themeMode } = useTheme();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { events, addEvent, updateEvent, deleteEvent, isLoading, isSyncing, isCloudEnabled } = useEvents();
  const isDark = themeMode === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  const handleOpenModal = () => {
    setEditingEvent(null);
    setModalVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (event: Event) => {
    if (editingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
  };

  const handleAuthButtonPress = () => {
    setProfileModalVisible(true);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Show email confirmation screen if user signed up but hasn't confirmed email
  if (pendingConfirmationEmail) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <EmailConfirmationScreen
          email={pendingConfirmationEmail}
          onBackToLogin={() => setPendingConfirmationEmail(null)}
        />
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <AuthScreen
          onClose={() => {}}
          onSuccess={(email?: string) => {
            // If email is provided, it means user just signed up and needs to confirm
            if (email) {
              setPendingConfirmationEmail(email);
            }
          }}
        />
      </View>
    );
  }

  // Check if user is authenticated but email is not confirmed
  if (user && !user.email_confirmed_at && user.email) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <EmailConfirmationScreen
          email={user.email}
          onBackToLogin={() => {
            // Will trigger re-check
          }}
        />
      </View>
    );
  }

  // Show main app if authenticated
  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>⏰ {APP_CONFIG.name}</Text>
            {isCloudEnabled && isAuthenticated && (
              <View style={styles.cloudBadge}>
                <Text style={styles.cloudBadgeText}>
                  {isSyncing ? '🔄 Sync...' : '☁️ Cloud'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <AuthButton onPress={handleAuthButtonPress} />
            <LogoutButton />
          </View>
        </View>

        {/* Event List */}
        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Carregando eventos...</Text>
            </View>
          ) : (
            <EventListWithTabs
              events={events}
              onEventPress={() => {}}
              onEventEdit={handleEditEvent}
              onEventDelete={(event) => deleteEvent(event.id)}
            />
          )}
        </View>

        {/* FAB Button */}
        <FAB onPress={handleOpenModal} />

        {/* Add/Edit Event Modal */}
        <AddEditEventModal
          visible={modalVisible}
          event={editingEvent}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />

        {/* Profile Modal */}
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <ProfileScreen onClose={() => setProfileModalVisible(false)} />
        </Modal>
      </LinearGradient>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventsProvider>
          <AppContent />
        </EventsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cloudBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cloudBadgeText: {
    fontSize: fontSize.xs,
    color: '#ffffff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: fontSize.md,
    opacity: 0.8,
  },
});

