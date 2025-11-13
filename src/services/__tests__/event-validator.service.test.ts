import { EventValidatorService, EventFormData } from '../event-validator.service';
import { Event } from '../../types';

describe('EventValidatorService', () => {
  const validFormData: EventFormData = {
    name: 'Test Event',
    date: '31/12/2025',
    time: '23:59',
    isRecurring: false,
    notificationEnabled: false,
  };

  describe('validateForm', () => {
    it('should validate correct form data', () => {
      const result = EventValidatorService.validateForm(validFormData);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail if name is empty', () => {
      const data = { ...validFormData, name: '' };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('nome');
    });

    it('should fail if date is invalid', () => {
      const data = { ...validFormData, date: '32/12/2025' };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should fail if time is invalid', () => {
      const data = { ...validFormData, time: '25:00' };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should fail if date is in the past', () => {
      const data = { ...validFormData, date: '01/01/2020', time: '00:00' };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('futuro');
    });

    it('should validate recurring config when isRecurring is true', () => {
      const data = { ...validFormData, isRecurring: true };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('recorrência');
    });

    it('should pass with valid recurring config', () => {
      const data = { ...validFormData, isRecurring: true, recurringType: 'yearly' as const };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(true);
    });

    it('should validate notification times when enabled', () => {
      const data = {
        ...validFormData,
        notificationEnabled: true,
        notificationTimes: [],
      };
      const result = EventValidatorService.validateForm(data);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('notificação');
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(EventValidatorService.validateName('Test Event').isValid).toBe(true);
      expect(EventValidatorService.validateName('Event 123').isValid).toBe(true);
      expect(EventValidatorService.validateName('🎉 Party').isValid).toBe(true);
    });

    it('should reject empty names', () => {
      expect(EventValidatorService.validateName('').isValid).toBe(false);
      expect(EventValidatorService.validateName('   ').isValid).toBe(false);
    });

    it('should reject names shorter than 3 characters', () => {
      const result = EventValidatorService.validateName('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('3 caracteres');
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'A'.repeat(101);
      const result = EventValidatorService.validateName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('100 caracteres');
    });
  });

  describe('validateDateFormat', () => {
    it('should accept valid dates', () => {
      expect(EventValidatorService.validateDateFormat('01/01/2025').isValid).toBe(true);
      expect(EventValidatorService.validateDateFormat('31/12/2025').isValid).toBe(true);
      expect(EventValidatorService.validateDateFormat('29/02/2024').isValid).toBe(true); // Leap year
    });

    it('should reject empty date', () => {
      const result = EventValidatorService.validateDateFormat('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Selecione uma data');
    });

    it('should reject invalid format', () => {
      expect(EventValidatorService.validateDateFormat('2025-12-31').isValid).toBe(false);
      expect(EventValidatorService.validateDateFormat('31-12-2025').isValid).toBe(false);
      expect(EventValidatorService.validateDateFormat('31/12').isValid).toBe(false);
    });

    it('should reject invalid month', () => {
      expect(EventValidatorService.validateDateFormat('01/13/2025').isValid).toBe(false);
      expect(EventValidatorService.validateDateFormat('01/00/2025').isValid).toBe(false);
    });

    it('should reject invalid day', () => {
      expect(EventValidatorService.validateDateFormat('32/01/2025').isValid).toBe(false);
      expect(EventValidatorService.validateDateFormat('00/01/2025').isValid).toBe(false);
    });

    it('should reject invalid year range', () => {
      expect(EventValidatorService.validateDateFormat('01/01/1999').isValid).toBe(false);
      expect(EventValidatorService.validateDateFormat('01/01/2101').isValid).toBe(false);
    });

    it('should reject invalid dates for month', () => {
      expect(EventValidatorService.validateDateFormat('31/02/2025').isValid).toBe(false); // Feb 31
      expect(EventValidatorService.validateDateFormat('31/04/2025').isValid).toBe(false); // Apr 31
      expect(EventValidatorService.validateDateFormat('29/02/2025').isValid).toBe(false); // Non-leap year
    });
  });

  describe('validateTimeFormat', () => {
    it('should accept valid times', () => {
      expect(EventValidatorService.validateTimeFormat('00:00').isValid).toBe(true);
      expect(EventValidatorService.validateTimeFormat('12:30').isValid).toBe(true);
      expect(EventValidatorService.validateTimeFormat('23:59').isValid).toBe(true);
    });

    it('should reject empty time', () => {
      const result = EventValidatorService.validateTimeFormat('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Selecione um horário');
    });

    it('should reject invalid format', () => {
      expect(EventValidatorService.validateTimeFormat('12').isValid).toBe(false);
      expect(EventValidatorService.validateTimeFormat('12:').isValid).toBe(false);
      expect(EventValidatorService.validateTimeFormat('12:3').isValid).toBe(false);
    });

    it('should reject invalid hour', () => {
      expect(EventValidatorService.validateTimeFormat('24:00').isValid).toBe(false);
      expect(EventValidatorService.validateTimeFormat('25:30').isValid).toBe(false);
    });

    it('should reject invalid minute', () => {
      expect(EventValidatorService.validateTimeFormat('12:60').isValid).toBe(false);
      expect(EventValidatorService.validateTimeFormat('12:99').isValid).toBe(false);
    });
  });

  describe('validateFutureDate', () => {
    it('should accept future dates', () => {
      const result = EventValidatorService.validateFutureDate('31/12/2030', '23:59');
      expect(result.isValid).toBe(true);
    });

    it('should reject past dates', () => {
      const result = EventValidatorService.validateFutureDate('01/01/2020', '00:00');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('futuro');
    });

    it('should reject malformed dates', () => {
      const result = EventValidatorService.validateFutureDate('invalid', '12:00');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRecurringConfig', () => {
    it('should accept valid recurring types', () => {
      expect(EventValidatorService.validateRecurringConfig('yearly').isValid).toBe(true);
      expect(EventValidatorService.validateRecurringConfig('monthly').isValid).toBe(true);
      expect(EventValidatorService.validateRecurringConfig('weekly').isValid).toBe(true);
    });

    it('should reject undefined recurring type', () => {
      const result = EventValidatorService.validateRecurringConfig(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('recorrência');
    });

    it('should reject invalid recurring type', () => {
      const result = EventValidatorService.validateRecurringConfig('daily' as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('inválido');
    });
  });

  describe('validateNotificationTimes', () => {
    it('should accept valid notification times', () => {
      expect(EventValidatorService.validateNotificationTimes([60, 1440]).isValid).toBe(true);
      expect(EventValidatorService.validateNotificationTimes([15, 30, 60]).isValid).toBe(true);
    });

    it('should reject empty array', () => {
      const result = EventValidatorService.validateNotificationTimes([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('pelo menos um');
    });

    it('should reject non-array input', () => {
      const result = EventValidatorService.validateNotificationTimes('invalid' as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('inválidos');
    });

    it('should reject more than 5 times', () => {
      const result = EventValidatorService.validateNotificationTimes([1, 2, 3, 4, 5, 6]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Máximo de 5');
    });

    it('should reject negative numbers', () => {
      const result = EventValidatorService.validateNotificationTimes([60, -10]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positivos');
    });

    it('should reject non-number values', () => {
      const result = EventValidatorService.validateNotificationTimes([60, 'invalid' as any]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positivos');
    });
  });

  describe('validateEvent', () => {
    const validEvent: Event = {
      id: '1',
      name: 'Test Event',
      targetDate: '2025-12-31T23:59:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      isRecurring: false,
      notificationEnabled: false,
    };

    it('should accept valid event', () => {
      const result = EventValidatorService.validateEvent(validEvent);
      expect(result.isValid).toBe(true);
    });

    it('should reject event without ID', () => {
      const event = { ...validEvent, id: undefined as any };
      const result = EventValidatorService.validateEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should reject event without name', () => {
      const event = { ...validEvent, name: undefined as any };
      const result = EventValidatorService.validateEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Nome');
    });

    it('should reject event without targetDate', () => {
      const event = { ...validEvent, targetDate: undefined as any };
      const result = EventValidatorService.validateEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Data do evento');
    });

    it('should reject event without createdAt', () => {
      const event = { ...validEvent, createdAt: undefined as any };
      const result = EventValidatorService.validateEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('criação');
    });

    it('should reject recurring event without recurringType', () => {
      const event = { ...validEvent, isRecurring: true, recurringType: undefined };
      const result = EventValidatorService.validateEvent(event);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('recorrência');
    });
  });

  describe('convertFormDateToISO', () => {
    it('should convert valid date and time to ISO', () => {
      const iso = EventValidatorService.convertFormDateToISO('31/12/2025', '23:59');
      expect(iso).toBeTruthy();
      
      if (iso) {
        const date = new Date(iso);
        expect(date.getFullYear()).toBe(2025);
        expect(date.getMonth()).toBe(11); // December (0-indexed)
        expect(date.getDate()).toBe(31);
        expect(date.getHours()).toBe(23);
        expect(date.getMinutes()).toBe(59);
      }
    });

    it('should return null for invalid date', () => {
      expect(EventValidatorService.convertFormDateToISO('invalid', '12:00')).toBeNull();
      expect(EventValidatorService.convertFormDateToISO('32/01/2025', '12:00')).toBeNull();
    });

    it('should return null for invalid time', () => {
      expect(EventValidatorService.convertFormDateToISO('01/01/2025', 'invalid')).toBeNull();
      expect(EventValidatorService.convertFormDateToISO('01/01/2025', '25:00')).toBeNull();
    });
  });

  describe('isUniqueEventName', () => {
    const existingEvents: Event[] = [
      {
        id: '1',
        name: 'Birthday',
        targetDate: '2025-12-25T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isRecurring: false,
        notificationEnabled: false,
      },
      {
        id: '2',
        name: 'Anniversary',
        targetDate: '2025-06-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isRecurring: false,
        notificationEnabled: false,
      },
    ];

    it('should return true for unique name', () => {
      expect(EventValidatorService.isUniqueEventName('New Event', existingEvents)).toBe(true);
    });

    it('should return false for duplicate name', () => {
      expect(EventValidatorService.isUniqueEventName('Birthday', existingEvents)).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(EventValidatorService.isUniqueEventName('birthday', existingEvents)).toBe(false);
      expect(EventValidatorService.isUniqueEventName('BIRTHDAY', existingEvents)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(EventValidatorService.isUniqueEventName('  Birthday  ', existingEvents)).toBe(false);
    });

    it('should allow same name when excludeId matches', () => {
      expect(EventValidatorService.isUniqueEventName('Birthday', existingEvents, '1')).toBe(true);
    });

    it('should return true for empty events list', () => {
      expect(EventValidatorService.isUniqueEventName('Any Name', [])).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message as-is', () => {
      const error = 'Test error message';
      expect(EventValidatorService.getErrorMessage(error)).toBe(error);
    });

    it('should support locale parameter', () => {
      const error = 'Test error';
      expect(EventValidatorService.getErrorMessage(error, 'en-US')).toBe(error);
      expect(EventValidatorService.getErrorMessage(error, 'pt-BR')).toBe(error);
    });
  });
});

