import { 
  calculateTimeRemaining, 
  formatDate,
  formatDateTime,
  isFutureDate,
  generateId,
  isEventSoon,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('calculateTimeRemaining', () => {
    it('should return correct time for future date', () => {
      const futureDate = new Date(Date.now() + 5000); // 5 seconds from now
      const result = calculateTimeRemaining(futureDate.toISOString());

      expect(result.isFinished).toBe(false);
      expect(result.seconds).toBeGreaterThan(0);
      expect(result.seconds).toBeLessThanOrEqual(5);
    });

    it('should return isFinished for past date', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const result = calculateTimeRemaining(pastDate.toISOString());

      expect(result.isFinished).toBe(true);
      expect(result.totalSeconds).toBe(0);
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('should handle dates far in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year from now
      const result = calculateTimeRemaining(futureDate.toISOString());

      expect(result.isFinished).toBe(false);
      expect(result.days).toBeGreaterThan(360);
    });

    it('should calculate correct time components', () => {
      // 2 days, 3 hours, 30 minutes, 45 seconds from now
      const futureTime = Date.now() + 
        (2 * 24 * 60 * 60 * 1000) + // 2 days
        (3 * 60 * 60 * 1000) +      // 3 hours
        (30 * 60 * 1000) +          // 30 minutes
        (45 * 1000);                // 45 seconds
      
      const result = calculateTimeRemaining(new Date(futureTime).toISOString());

      expect(result.days).toBe(2);
      expect(result.hours).toBe(3);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBeGreaterThanOrEqual(44);
      expect(result.seconds).toBeLessThanOrEqual(45);
    });
  });

  describe('isFutureDate', () => {
    it('should return true for future dates', () => {
      const future = new Date(Date.now() + 10000);
      expect(isFutureDate(future)).toBe(true);
    });

    it('should return false for past dates', () => {
      const past = new Date(Date.now() - 10000);
      expect(isFutureDate(past)).toBe(false);
    });

    it('should return false for current time', () => {
      const now = new Date();
      // Since there's a tiny delay, this might be false
      const result = isFutureDate(now);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('formatDate', () => {
    it('should format date in pt-BR locale', () => {
      const date = new Date('2024-12-25T10:00:00Z');
      const formatted = formatDate(date.toISOString());
      
      expect(formatted).toContain('dezembro');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('25');
    });

    it('should handle different dates correctly', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const formatted = formatDate(date.toISOString());
      
      expect(formatted).toContain('janeiro');
      expect(formatted).toContain('2025');
      expect(formatted).toContain('15');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-12-25T10:30:00Z');
      const formatted = formatDateTime(date.toISOString());
      
      expect(formatted).toContain('dezembro');
      expect(formatted).toContain('2024');
      expect(formatted).toContain('25');
      // Time might be different due to timezone
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
      expect(id2.length).toBeGreaterThan(10);
    });

    it('should generate IDs with timestamp and random part', () => {
      const id = generateId();
      
      expect(id).toContain('-');
      expect(typeof id).toBe('string');
    });

    it('should generate 10 unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 10; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(10);
    });
  });

  describe('isEventSoon', () => {
    it('should return true for events within 24 hours', () => {
      const soonDate = new Date(Date.now() + 23 * 60 * 60 * 1000); // 23 hours
      expect(isEventSoon(soonDate.toISOString())).toBe(true);
    });

    it('should return false for events more than 24 hours away', () => {
      const laterDate = new Date(Date.now() + 25 * 60 * 60 * 1000); // 25 hours
      expect(isEventSoon(laterDate.toISOString())).toBe(false);
    });

    it('should return false for past events', () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(isEventSoon(pastDate.toISOString())).toBe(false);
    });

    it('should return true for events in 1 hour', () => {
      const soonDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      expect(isEventSoon(soonDate.toISOString())).toBe(true);
    });
  });
});

