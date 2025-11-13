import { Event } from '../types';
import { isFutureDate } from '../utils/dateUtils';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Event form data interface (before conversion to Event)
 */
export interface EventFormData {
  name: string;
  date: string; // dd/mm/yyyy format
  time: string; // HH:MM format
  categoryId?: string;
  isRecurring?: boolean;
  recurringType?: 'yearly' | 'monthly' | 'weekly';
  notificationEnabled?: boolean;
  notificationTimes?: number[];
}

/**
 * EventValidatorService
 * 
 * Centralizes all event validation logic:
 * - Form input validation
 * - Date/time validation
 * - Business rules validation
 * - Recurring event validation
 * 
 * Benefits:
 * - Reusable validation logic
 * - Consistent error messages
 * - Easy to test
 * - Single source of truth
 */
export class EventValidatorService {
  /**
   * Validate complete event form data
   * Returns validation result with specific error message
   */
  static validateForm(data: EventFormData): ValidationResult {
    // Validate name
    const nameResult = this.validateName(data.name);
    if (!nameResult.isValid) return nameResult;

    // Validate date format
    const dateResult = this.validateDateFormat(data.date);
    if (!dateResult.isValid) return dateResult;

    // Validate time format
    const timeResult = this.validateTimeFormat(data.time);
    if (!timeResult.isValid) return timeResult;

    // Validate date is in future
    const futureResult = this.validateFutureDate(data.date, data.time);
    if (!futureResult.isValid) return futureResult;

    // Validate recurring config if applicable
    if (data.isRecurring) {
      const recurringResult = this.validateRecurringConfig(data.recurringType);
      if (!recurringResult.isValid) return recurringResult;
    }

    // Validate notification times if applicable
    if (data.notificationEnabled && data.notificationTimes) {
      const notificationResult = this.validateNotificationTimes(data.notificationTimes);
      if (!notificationResult.isValid) return notificationResult;
    }

    return { isValid: true };
  }

  /**
   * Validate event name
   */
  static validateName(name: string): ValidationResult {
    if (!name || !name.trim()) {
      return {
        isValid: false,
        error: 'Digite um nome para o evento',
      };
    }

    if (name.trim().length < 3) {
      return {
        isValid: false,
        error: 'Nome deve ter pelo menos 3 caracteres',
      };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Nome não pode exceder 100 caracteres',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate date format (dd/mm/yyyy)
   */
  static validateDateFormat(date: string): ValidationResult {
    if (!date) {
      return {
        isValid: false,
        error: 'Selecione uma data',
      };
    }

    // Validate format dd/mm/yyyy
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dateMatch = date.match(dateRegex);

    if (!dateMatch) {
      return {
        isValid: false,
        error: 'Data inválida. Use o formato dd/mm/yyyy',
      };
    }

    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);

    // Validate ranges
    if (month < 1 || month > 12) {
      return {
        isValid: false,
        error: 'Mês inválido (1-12)',
      };
    }

    if (day < 1 || day > 31) {
      return {
        isValid: false,
        error: 'Dia inválido (1-31)',
      };
    }

    if (year < 2000 || year > 2100) {
      return {
        isValid: false,
        error: 'Ano deve estar entre 2000 e 2100',
      };
    }

    // Validate actual date (e.g., no Feb 30)
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getDate() !== day ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getFullYear() !== year
    ) {
      return {
        isValid: false,
        error: 'Data inválida para o mês selecionado',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate time format (HH:MM)
   */
  static validateTimeFormat(time: string): ValidationResult {
    if (!time) {
      return {
        isValid: false,
        error: 'Selecione um horário',
      };
    }

    // Validate format HH:MM
    const timeRegex = /^(\d{2}):(\d{2})$/;
    const timeMatch = time.match(timeRegex);

    if (!timeMatch) {
      return {
        isValid: false,
        error: 'Horário inválido. Use o formato HH:MM',
      };
    }

    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    if (hour < 0 || hour > 23) {
      return {
        isValid: false,
        error: 'Hora inválida (0-23)',
      };
    }

    if (minute < 0 || minute > 59) {
      return {
        isValid: false,
        error: 'Minuto inválido (0-59)',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate that date/time is in the future
   */
  static validateFutureDate(date: string, time: string): ValidationResult {
    const dateMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

    if (!dateMatch || !timeMatch) {
      return {
        isValid: false,
        error: 'Data ou horário inválido',
      };
    }

    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    const targetDate = new Date(year, month - 1, day, hour, minute);

    if (isNaN(targetDate.getTime())) {
      return {
        isValid: false,
        error: 'Data inválida',
      };
    }

    if (!isFutureDate(targetDate)) {
      return {
        isValid: false,
        error: 'A data deve ser no futuro',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate recurring configuration
   */
  static validateRecurringConfig(
    recurringType?: 'yearly' | 'monthly' | 'weekly'
  ): ValidationResult {
    if (!recurringType) {
      return {
        isValid: false,
        error: 'Selecione o tipo de recorrência',
      };
    }

    if (!['yearly', 'monthly', 'weekly'].includes(recurringType)) {
      return {
        isValid: false,
        error: 'Tipo de recorrência inválido',
      };
    }

    return { isValid: true };
  }

  /**
   * Validate notification times array
   */
  static validateNotificationTimes(times: number[]): ValidationResult {
    if (!Array.isArray(times)) {
      return {
        isValid: false,
        error: 'Horários de notificação inválidos',
      };
    }

    if (times.length === 0) {
      return {
        isValid: false,
        error: 'Selecione pelo menos um horário de notificação',
      };
    }

    if (times.length > 5) {
      return {
        isValid: false,
        error: 'Máximo de 5 horários de notificação',
      };
    }

    // Validate each time is a positive number
    for (const time of times) {
      if (typeof time !== 'number' || time < 0) {
        return {
          isValid: false,
          error: 'Horários de notificação devem ser números positivos',
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validate complete Event object
   * Useful for validating data from API or storage
   */
  static validateEvent(event: Partial<Event>): ValidationResult {
    if (!event.id) {
      return {
        isValid: false,
        error: 'ID do evento obrigatório',
      };
    }

    if (!event.name || !event.name.trim()) {
      return {
        isValid: false,
        error: 'Nome do evento obrigatório',
      };
    }

    if (!event.targetDate) {
      return {
        isValid: false,
        error: 'Data do evento obrigatória',
      };
    }

    if (!event.createdAt) {
      return {
        isValid: false,
        error: 'Data de criação obrigatória',
      };
    }

    // Validate recurring config if event is recurring
    if (event.isRecurring && !event.recurringType) {
      return {
        isValid: false,
        error: 'Tipo de recorrência obrigatório para eventos recorrentes',
      };
    }

    return { isValid: true };
  }

  /**
   * Convert dd/mm/yyyy and HH:MM to ISO date string
   * Helper method for form submission
   */
  static convertFormDateToISO(date: string, time: string): string | null {
    // Validate date format first
    const dateValidation = this.validateDateFormat(date);
    if (!dateValidation.isValid) {
      return null;
    }

    // Validate time format
    const timeValidation = this.validateTimeFormat(time);
    if (!timeValidation.isValid) {
      return null;
    }

    const dateMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const timeMatch = time.match(/^(\d{2}):(\d{2})$/);

    if (!dateMatch || !timeMatch) {
      return null;
    }

    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    const targetDate = new Date(year, month - 1, day, hour, minute);

    if (isNaN(targetDate.getTime())) {
      return null;
    }

    return targetDate.toISOString();
  }

  /**
   * Validate that event name is unique in a list
   * Useful for preventing duplicates
   */
  static isUniqueEventName(name: string, existingEvents: Event[], excludeId?: string): boolean {
    const normalizedName = name.trim().toLowerCase();
    
    return !existingEvents.some(
      event => 
        event.name.trim().toLowerCase() === normalizedName &&
        event.id !== excludeId
    );
  }

  /**
   * Get user-friendly error message
   * Can be extended for internationalization
   */
  static getErrorMessage(error: string, locale: string = 'pt-BR'): string {
    // Currently returns error as-is
    // Can be extended to translate errors based on locale
    return error;
  }
}

