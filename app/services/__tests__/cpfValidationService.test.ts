import { cpfValidationService } from '../cpfValidationService';
// We can also import isValidCpfFormat if we want to cross-check its behavior
// import { isValidCpfFormat as localFormatValidator } from '@/utils/validators';

// Mocking the delay directly in the service is hard to test without complex timer mocks.
// For unit testing the logic, we assume the delay works and focus on the branching.

describe('MockCpfValidationService', () => {
  // These are defined in the mock service implementation
  const MOCK_VALID_CPFS = ["11122233344", "55566677788"];
  const MOCK_FLAGGED_CPFS = ["12345678900"];

  it('should return isValid: false for invalid CPF format (e.g., too short)', async () => {
    const result = await cpfValidationService.validateCpf('123');
    expect(result.isValid).toBe(false);
    expect(result.isFormatValid).toBe(false);
    expect(result.message).toContain("Formato de CPF inválido");
  });

  it('should return isValid: false for CPF with all same digits (format check)', async () => {
    const result = await cpfValidationService.validateCpf('11111111111');
    expect(result.isValid).toBe(false);
    expect(result.isFormatValid).toBe(false);
    expect(result.message).toContain("Formato de CPF inválido");
  });

  it('should return isValid: true for a CPF in MOCK_VALID_CPFS', async () => {
    const result = await cpfValidationService.validateCpf(MOCK_VALID_CPFS[0]);
    expect(result.isValid).toBe(true);
    expect(result.isFormatValid).toBe(true);
    expect(result.isAvailable).toBe(true);
    expect(result.message).toContain("CPF válido (mock service)");

    const result2 = await cpfValidationService.validateCpf(` ${MOCK_VALID_CPFS[1]} `); // Test with spaces
    expect(result2.isValid).toBe(true);
    expect(result2.message).toContain("CPF válido (mock service)");
  });

  it('should return isValid: false for a CPF in MOCK_FLAGGED_CPFS', async () => {
    const result = await cpfValidationService.validateCpf(MOCK_FLAGGED_CPFS[0]);
    expect(result.isValid).toBe(false);
    expect(result.isFormatValid).toBe(true); // Format is fine, but it's flagged
    expect(result.isAvailable).toBe(false);
    expect(result.message).toContain("CPF com restrições ou inválido (mock service)");
  });

  it('should return isValid: true (default) for a CPF not in specific lists but with valid format', async () => {
    const result = await cpfValidationService.validateCpf('98765432100'); // Valid format, not in lists
    expect(result.isValid).toBe(true);
    expect(result.isFormatValid).toBe(true);
    expect(result.isAvailable).toBe(true);
    expect(result.message).toContain("CPF parece válido (mock service - default)");
  });

  it('should handle CPFs with formatting characters correctly by cleaning them first', async () => {
    const result = await cpfValidationService.validateCpf('111.222.333-44'); // Corresponds to MOCK_VALID_CPFS[0]
    expect(result.isValid).toBe(true);
    expect(result.message).toContain("CPF válido (mock service)");

    const resultFlagged = await cpfValidationService.validateCpf('123.456.789-00'); // Corresponds to MOCK_FLAGGED_CPFS[0]
    expect(resultFlagged.isValid).toBe(false);
    expect(resultFlagged.message).toContain("CPF com restrições ou inválido (mock service)");
  });
});
