
"use server"

// In a real app, this would be a Firestore check.
// Using a mock set of codes for demonstration.
const AUTHORIZED_CODES = ["MYTH-2024", "RUBY-ELITE", "HALL-BLACK-V1", "ELITE-PET"];
const USED_CODES = new Set<string>();

export async function validateMythicCode(code: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  if (!AUTHORIZED_CODES.includes(normalizedCode)) {
    return { success: false, message: "Chave Mítica Inválida" };
  }

  if (USED_CODES.has(normalizedCode)) {
    return { success: false, message: "Chave Mítica já Utilizada" };
  }

  // Mark code as used
  USED_CODES.add(normalizedCode);

  return {
    success: true,
    message: "Acesso Concedido",
    profile: {
      name: "Membro da Elite",
      status: "MYTHIC",
      rank: 42,
    }
  };
}
