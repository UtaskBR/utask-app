import { isValidCpfFormat } from '../validators';

describe('isValidCpfFormat', () => {
  it('should return true for a valid CPF format', () => {
    expect(isValidCpfFormat('12345678909')).toBe(true);
    expect(isValidCpfFormat('123.456.789-09')).toBe(true);
  });

  it('should return false for CPFs with incorrect length', () => {
    expect(isValidCpfFormat('1234567890')).toBe(false); // Too short
    expect(isValidCpfFormat('123456789099')).toBe(false); // Too long
  });

  it('should return false for CPFs with non-digit characters (after stripping)', () => {
    // The function itself strips non-digits, so this tests length after stripping
    expect(isValidCpfFormat('1234567890a')).toBe(false); // effectively 10 digits
  });

  it('should return false for CPFs that are all the same digit', () => {
    expect(isValidCpfFormat('11111111111')).toBe(false);
    expect(isValidCpfFormat('222.222.222-22')).toBe(false);
    expect(isValidCpfFormat('00000000000')).toBe(false);
  });

  it('should return false for null or undefined input', () => {
    expect(isValidCpfFormat(null)).toBe(false);
    expect(isValidCpfFormat(undefined)).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isValidCpfFormat('')).toBe(false);
  });

  it('should correctly handle CPF with mixed formatting if it cleans to 11 digits', () => {
    expect(isValidCpfFormat('123.456789-09')).toBe(true); // 12345678909
  });
});
