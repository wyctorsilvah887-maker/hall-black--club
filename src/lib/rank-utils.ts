/**
 * @fileOverview Utilitários para cálculo de patente baseada em tempo de casa.
 */

export type RankStatus = 'MASTER' | 'ELITE' | 'LEGENDARY' | 'AMBER' | 'MYTHIC' | 'HALL_BLACK';

/**
 * Calcula a patente atual baseada na data de registro.
 * - MASTER (Mestre): 0-4 meses
 * - ELITE (Elite): 4-9 meses
 * - LEGENDARY (Lendário Gold): 9-12 meses
 * - AMBER (Legendário Âmbar): 12-18 meses
 * - MYTHIC (Mítico Rubi): 18-24 meses
 * - HALL_BLACK: 24+ meses (Ápice Supremo)
 */
export function calculateRankByTime(registrationDate: string | undefined, currentStatus?: string): RankStatus {
  if (!registrationDate) return (currentStatus as RankStatus) || 'MASTER';

  // O nível Hall Black é o ápice e não é reduzido
  if (currentStatus === 'HALL_BLACK') {
    return 'HALL_BLACK';
  }

  const start = new Date(registrationDate);
  const now = new Date();
  const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  if (diffMonths >= 24) {
    return 'HALL_BLACK';
  } else if (diffMonths >= 18) {
    return 'MYTHIC';
  } else if (diffMonths >= 12) {
    return 'AMBER';
  } else if (diffMonths >= 9) {
    return 'LEGENDARY';
  } else if (diffMonths >= 4) {
    return 'ELITE';
  }

  return 'MASTER';
}

export function getRankLabel(status: string): string {
  switch (status) {
    case 'HALL_BLACK': return 'HALL BLACK';
    case 'MYTHIC': return 'MÍTICO RUBI';
    case 'AMBER': return 'LEGENDÁRIO ÂMBAR';
    case 'LEGENDARY': return 'LENDÁRIO';
    case 'ELITE': return 'MEMBRO ELITE';
    default: return 'MESTRE DO CLUBE';
  }
}