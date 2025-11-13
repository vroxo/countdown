import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Event, EventFormData } from '../types';
import { spacing, fontSize, borderRadius } from '../theme/styles';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { generateId } from '../utils/dateUtils';
import { EventValidatorService } from '../services/event-validator.service';

interface AddEditEventModalProps {
  visible: boolean;
  event?: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
}

export const AddEditEventModal: React.FC<AddEditEventModalProps> = ({
  visible,
  event,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const isEditing = !!event;

  // Form state
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [error, setError] = useState('');

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setName(event.name);
      const eventDate = new Date(event.targetDate);
      // Format to dd/mm/yyyy
      const day = String(eventDate.getDate()).padStart(2, '0');
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const year = eventDate.getFullYear();
      setDate(`${day}/${month}/${year}`);
      setTime(eventDate.toTimeString().slice(0, 5));
      setCategoryId(event.categoryId);
      setIsRecurring(event.isRecurring);
      setNotificationEnabled(event.notificationEnabled);
    } else {
      resetForm();
    }
  }, [event, visible]);

  const resetForm = () => {
    setName('');
    setDate('');
    setTime('');
    setCategoryId(undefined);
    setIsRecurring(false);
    setNotificationEnabled(true);
    setError('');
  };

  const validateForm = (): boolean => {
    // Use EventValidatorService for validation
    const result = EventValidatorService.validateForm({
      name,
      date,
      time,
      isRecurring,
      recurringType: isRecurring ? 'yearly' : undefined,
      notificationEnabled,
    });

    if (!result.isValid) {
      setError(result.error || 'Erro de validação');
      return false;
    }

    setError('');
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Convert date/time to ISO using EventValidatorService
    const targetDateISO = EventValidatorService.convertFormDateToISO(date, time);
    
    if (!targetDateISO) {
      setError('Erro ao processar data');
      return;
    }

    const newEvent: Event = {
      id: event?.id || generateId(),
      name: name.trim(),
      targetDate: targetDateISO,
      createdAt: event?.createdAt || new Date().toISOString(),
      categoryId,
      isRecurring,
      notificationEnabled,
      ...(isRecurring && { recurringType: 'yearly' }),
    };

    onSave(newEvent);
    handleClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Event Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Nome do Evento</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Ex: Aniversário do João"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Data</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={theme.colors.textSecondary}
                value={date}
                onChangeText={setDate}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Time */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Horário</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.textSecondary}
                value={time}
                onChangeText={setTime}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Categoria</Text>
              <View style={styles.categoryGrid}>
                {DEFAULT_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: categoryId === category.id
                          ? category.color + '30'
                          : theme.colors.card,
                        borderColor: categoryId === category.id ? category.color : theme.colors.border,
                      },
                    ]}
                    onPress={() => setCategoryId(category.id)}
                  >
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        {
                          color: categoryId === category.id ? category.color : theme.colors.text,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurring */}
            <View style={[styles.inputGroup, styles.switchRow]}>
              <View>
                <Text style={[styles.label, { color: theme.colors.text }]}>Evento Recorrente</Text>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Se repete anualmente
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
                thumbColor={isRecurring ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            {/* Notifications */}
            <View style={[styles.inputGroup, styles.switchRow]}>
              <View>
                <Text style={[styles.label, { color: theme.colors.text }]}>Notificações</Text>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Receber alertas antes do evento
                </Text>
              </View>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
                thumbColor={notificationEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.card }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                {isEditing ? 'Salvar' : 'Criar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: fontSize.xl,
    fontWeight: '300',
  },
  scrollView: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  categoryEmoji: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  categoryName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  saveButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

