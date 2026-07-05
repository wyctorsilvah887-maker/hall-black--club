
/**
 * @fileOverview Utilitários para cálculo de patente baseada em tempo de casa.
 */

export type RankStatus = 'MASTER' | 'ELITE' | 'LEGENDARY' | 'AMBER' | 'MYTHIC';

/**
 * Calcula a patente atual baseada na data de registro.
 * - MASTER: 0-4 meses
 * - ELITE: 4-9 meses
 * - LEGENDARY (Lendário Gold): 9-12 meses
 * - AMBER (Legendário Âmbar): 12+ meses (Nível superior temporal)
 * 
 * A patente MYTHIC é o ápice absoluto e mantida se já atribuída.
 */
export function calculateRankByTime(registrationDate: string | undefined, currentStatus?: string): RankStatus {
  if (!registrationDate) return (currentStatus as RankStatus) || 'MASTER';

  // O nível Mítico é o ápice e não é reduzido
  if (currentStatus === 'MYTHIC') {
    return 'MYTHIC';
  }

  const start = new Date(registrationDate);
  const now = new Date();
  
  // Cálculo de meses totais
  const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  if (diffMonths >= 12) {
    return 'AMBER'; // Legendário Âmbar (Superior)
  } else if (diffMonths >= 9) {
    return 'LEGENDARY'; // Lendário (Gold)
  } else if (diffMonths >= 4) {
    return 'ELITE'; // Membro Elite
  }

  return 'MASTER'; // Mestre do Clube
}

export function getRankLabel(status: string): string {
  switch (status) {
    case 'MYTHIC': return 'MEMBRO MÍTICO';
    case 'AMBER': return 'LEGENDÁRIO ÂMBAR';
    case 'LEGENDARY': return 'LENDÁRIO';
    case 'ELITE': return 'MEMBRO ELITE';
    default: return 'MESTRE DO CLUBE';
  }
}
