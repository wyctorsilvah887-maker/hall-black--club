"use server"

// Chaves autorizadas por categoria
const MYTHIC_CODES = ["MYTH-2024", "RUBY-ELITE", "HALL-BLACK-V1", "ELITE-PET"];
const AMBER_CODES = ["AMBER-LEGEND"];
const LEGENDARY_CODES = ["LEGEND-GOLD"];
const USED_CODES = new Set<string>();

export async function validateMythicCode(code: string) {
  // Simula atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const normalizedCode = code.toUpperCase().trim();

  // Verificação Lendária (Dourado)
  if (LEGENDARY_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "ACESSO LENDÁRIO CONCEDIDO",
      profile: {
        name: "Lenda do Hall",
        status: "LEGENDARY",
        theme: "legendary",
        rank: 1,
      }
    };
  }

  // Verificação Âmbar (Laranja - Legendário)
  if (AMBER_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "MODO LEGENDÁRIO ATIVADO, BEM VINDO CLIENTE LEGENDÁRIO",
      profile: {
        name: "Guardião de Elite",
        status: "AMBER",
        theme: "amber",
        rank: 7,
      }
    };
  }

  // Verificação Mítica (Vermelho)
  if (MYTHIC_CODES.includes(normalizedCode)) {
    return {
      success: true,
      message: "Acesso Mítico Concedido",
      profile: {
        name: "Membro da Elite",
        status: "MYTHIC",
        theme: "mythic",
        rank: 42,
      }
    };
  }

  return { success: false, message: "Chave de Acesso Inválida" };
}
