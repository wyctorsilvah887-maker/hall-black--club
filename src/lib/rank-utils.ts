
/**
 * @fileOverview Utilitários para cálculo de patente baseada em tempo de casa.
 */

export type RankStatus = 'MASTER' | 'ELITE' | 'AMBER' | 'LEGENDARY' | 'MYTHIC';

/**
 * Calcula a patente atual baseada na data de registro.
 * - MASTER: 0-4 meses
 * - ELITE: 4-9 meses
 * - AMBER (Lendário Âmbar): 9+ meses
 * 
 * Patentes MYTHIC e LEGENDARY (Gold) são mantidas se já estiverem no perfil (níveis de honra ou manuais).
 */
export function calculateRankByTime(registrationDate: string | undefined, currentStatus?: string): RankStatus {
  if (!registrationDate) return (currentStatus as RankStatus) || 'MASTER';

  // Se o usuário já é Mítico ou Lendário Gold, não reduzimos a patente (honra adquirida)
  if (currentStatus === 'MYTHIC' || currentStatus === 'LEGENDARY') {
    return currentStatus as RankStatus;
  }

  const start = new Date(registrationDate);
  const now = new Date();
  
  // Cálculo de meses totais
  const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  if (diffMonths >= 9) {
    return 'AMBER'; // Lendário Âmbar
  } else if (diffMonths >= 4) {
    return 'ELITE'; // Membro Elite
  }

  return 'MASTER'; // Mestre do Clube
}

export function getRankLabel(status: string): string {
  switch (status) {
    case 'MYTHIC': return 'MEMBRO MÍTICO';
    case 'LEGENDARY': return 'LENDÁRIO GOLD';
    case 'AMBER': return 'LENDÁRIO ÂMBAR';
    case 'ELITE': return 'MEMBRO ELITE';
    default: return 'MESTRE DO CLUBE';
  }
}
