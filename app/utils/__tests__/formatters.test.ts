import { normalizeEmail } from '../formatters';

describe('normalizeEmail', () => {
  it('should convert email to lowercase', () => {
    expect(normalizeEmail('TestEmail@Example.COM')).toBe('testemail@example.com');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('should handle both lowercase conversion and trimming', () => {
    expect(normalizeEmail('  TestUser@Example.com  ')).toBe('testuser@example.com');
  });

  it('should return an empty string for null input', () => {
    expect(normalizeEmail(null)).toBe('');
  });

  it('should return an empty string for undefined input', () => {
    expect(normalizeEmail(undefined)).toBe('');
  });

  it('should return an empty string for empty string input', () => {
    expect(normalizeEmail('')).toBe('');
  });

  it('should handle emails with no changes needed', () => {
    expect(normalizeEmail('user@domain.co')).toBe('user@domain.co');
  });
});
