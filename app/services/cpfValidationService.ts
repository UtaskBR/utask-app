import { isValidCpfFormat } from "@/utils/validators";

interface CpfValidationResult {
  isValid: boolean;
  isFormatValid?: boolean; // If the service also checks format
  isAvailable?: boolean; // If the CPF is available (not tied to another critical status)
  message?: string;
}

interface CpfValidationService {
  validateCpf(cpf: string): Promise<CpfValidationResult>;
}

// --- Mock CPF Validation Service ---
// This mock simulates an external API call for CPF validation.
// In a real application, this would call a service like Receita Federal or Serpro.

const MOCK_VALID_CPFS = ["11122233344", "55566677788"]; // Example valid CPFs for mock
const MOCK_FLAGGED_CPFS = ["12345678900"]; // Example flagged/invalid CPFs for mock
const MOCK_API_DELAY_MS = 500; // Simulate network latency

class MockCpfValidationService implements CpfValidationService {
  async validateCpf(cpf: string): Promise<CpfValidationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY_MS));

    const cleanedCpf = cpf.replace(/\D/g, '');

    // First, use the local basic format validation
    if (!isValidCpfFormat(cleanedCpf)) {
      return {
        isValid: false,
        isFormatValid: false,
        message: "Formato de CPF inválido (mock service check).",
      };
    }

    // Mock specific CPF checks
    if (MOCK_VALID_CPFS.includes(cleanedCpf)) {
      return {
        isValid: true,
        isFormatValid: true,
        isAvailable: true,
        message: "CPF válido (mock service).",
      };
    }

    if (MOCK_FLAGGED_CPFS.includes(cleanedCpf)) {
      return {
        isValid: false,
        isFormatValid: true,
        isAvailable: false,
        message: "CPF com restrições ou inválido (mock service).",
      };
    }

    // Default mock behavior for other CPFs (e.g., treat as valid if format is okay)
    // Or, for stricter testing, uncomment the line below to make unspecified CPFs invalid.
    // return { isValid: false, isFormatValid: true, message: "CPF não reconhecido pelo mock service." };

    // For this example, if it passes format and isn't explicitly flagged, consider it valid by the mock.
    return {
      isValid: true,
      isFormatValid: true,
      isAvailable: true,
      message: "CPF parece válido (mock service - default).",
    };
  }
}

// Export an instance of the mock service
export const cpfValidationService: CpfValidationService = new MockCpfValidationService();
