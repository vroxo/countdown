import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useCountdown } from '../hooks/useCountdown';
import { CountdownDisplay } from './CountdownDisplay';
import { formatDateTime, isEventSoon } from '../utils/dateUtils';
import { shareEvent } from '../utils/shareUtils';
import { spacing, fontSize, borderRadius } from '../theme/styles';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onPress,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const timeRemaining = useCountdown(event.targetDate);
  const isSoon = isEventSoon(event.targetDate);
  const [showActions, setShowActions] = useState(false);

  const handleShare = async () => {
    const success = await shareEvent(event);
    if (success && Platform.OS !== 'web') {
      Alert.alert('Sucesso', 'Evento compartilhado!');
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      const confirmed = window.confirm(`Deseja realmente excluir "${event.name}"?`);
      if (confirmed && onDelete) {
        onDelete();
      }
    } else {
      // Use Alert.alert for mobile
      Alert.alert(
        'Confirmar exclusão',
        `Deseja realmente excluir "${event.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: () => onDelete?.()
          },
        ]
      );
    }
  };

  const handleLongPress = () => {
    setShowActions(!showActions);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: theme.colors.card }]}
    >
      {/* Indicator for events happening soon */}
      {isSoon && !timeRemaining.isFinished && (
        <LinearGradient
          colors={['#ef4444', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.soonBadge}
        >
          <Text style={styles.soonBadgeText}>🔥 Em breve!</Text>
        </LinearGradient>
      )}

      {/* Event Name */}
      <View style={styles.header}>
        <Text style={[styles.eventName, { color: theme.colors.text }]} numberOfLines={2}>
          {event.name}
        </Text>
        {event.isRecurring && (
          <Text style={styles.recurringIcon}>🔄</Text>
        )}
      </View>

      {/* Event Date */}
      <Text style={[styles.eventDate, { color: theme.colors.textSecondary }]}>
        📅 {formatDateTime(event.targetDate)}
      </Text>

      {/* Countdown Display */}
      <View style={styles.countdownContainer}>
        <CountdownDisplay time={timeRemaining} size="medium" />
      </View>

      {/* Category Badge (if exists) */}
      {event.categoryId && (
        <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {event.categoryId === '1' && '👤 Pessoal'}
            {event.categoryId === '2' && '💼 Trabalho'}
            {event.categoryId === '3' && '🎂 Aniversário'}
            {event.categoryId === '4' && '✈️ Viagem'}
            {event.categoryId === '5' && '🎉 Evento'}
          </Text>
        </View>
      )}

      {/* Action Buttons (shown on long press) */}
      {showActions && (
        <View style={[styles.actionsContainer, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              setShowActions(false);
              onEdit?.();
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              ✏️ Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              setShowActions(false);
              handleShare();
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              📤 Compartilhar
            </Text>
          </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: theme.colors.error }]}
                onPress={() => {
                  handleDelete();
                  setShowActions(false);
                }}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
                  🗑️ Excluir
                </Text>
              </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  soonBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.lg,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  soonBadgeText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  eventName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    flex: 1,
  },
  recurringIcon: {
    fontSize: fontSize.lg,
    marginLeft: spacing.sm,
  },
  eventDate: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  countdownContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  categoryText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

