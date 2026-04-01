"use server"

/**
 * @fileOverview Arquivo de Server Actions.
 * Removida a dependência do Firebase Client SDK para evitar erros de inicialização no servidor.
 */

export async function placeholderAction() {
  return { success: true };
}
