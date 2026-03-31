"use server"

// Chaves autorizadas
const MYTHIC_CODES = ["MYTH-2024", "RUBY-ELITE", "HALL-BLACK-V1", "ELITE-PET"];
const LEGENDARY_CODES = ["LEGEND-GOLD"];
const USED_CODES = new Set<string>();

export async function validateMythicCode(code: string) {
  // Simula atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  if (LEGENDARY_CODES.includes(normalizedCode)) {
    if (USED_CODES.has(normalizedCode)) {
      return { success: false, message: "Chave Lendária já Utilizada" };
    }
    // Mark code as used
    // USED_CODES.add(normalizedCode); // Comentado para facilitar testes múltiplos
    return {
      success: true,
      message: "ACESSO LENDÁRIO CONCEDIDO",
      profile: {
        name: "Lenda Viva do Hall",
        status: "LEGENDARY",
        theme: "legendary",
        rank: 1,
      }
    };
  }

  if (!MYTHIC_CODES.includes(normalizedCode)) {
    return { success: false, message: "Chave Inválida" };
  }

  if (USED_CODES.has(normalizedCode)) {
    return { success: false, message: "Chave já Utilizada" };
  }

  // USED_CODES.add(normalizedCode);
  return {
    success: true,
    message: "Acesso Concedido",
    profile: {
      name: "Membro da Elite",
      status: "MYTHIC",
      theme: "mythic",
      rank: 42,
    }
  };
}
