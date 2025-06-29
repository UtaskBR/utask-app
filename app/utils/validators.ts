/**
 * Validates the format of a Brazilian CPF number.
 * - Checks if it contains 11 digits.
 * - Checks if all characters are numbers.
 *
 * Note: This is a basic format validation, not a full algorithm check.
 *
 * @param cpf The CPF string to validate.
 * @returns True if the format is valid, false otherwise.
 */
export const isValidCpfFormat = (cpf: string | null | undefined): boolean => {
  if (!cpf) {
    return false;
  }
  const cleanedCpf = cpf.replace(/\D/g, ''); // Remove non-digit characters
  if (cleanedCpf.length !== 11) {
    return false;
  }
  // Optional: Check if all digits are the same (e.g., "11111111111"), which is invalid for real CPFs.
  // This is often part of the algorithm check, but can be a quick win here too.
  if (/^(\d)\1+$/.test(cleanedCpf)) {
    return false;
  }
  return true;
};

// More advanced CPF validation (checksum algorithm) can be added here later.
// For now, we'll stick to the basic format check.
