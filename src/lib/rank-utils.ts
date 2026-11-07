/**
 * @fileOverview Utilitários para cálculo de patente baseada em tempo de casa - Sovereign Founders Club.
 */

export type RankStatus = 'MASTER' | 'ELITE' | 'LEGENDARY' | 'AMBER' | 'MYTHIC' | 'HALL_BLACK';

/**
 * Calcula a patente atual baseada na data de registro.
 * - MASTER: 0-4 meses
 * - ELITE: 4-9 meses
 * - LEGENDARY: 9-12 meses
 * - AMBER: 12-18 meses
 * - MYTHIC: 18-24 meses
 * - SOVEREIGN: 24+ meses (Ápice Supremo)
 */
export function calculateRankByTime(registrationDate: string | undefined, currentStatus?: string): RankStatus {
  if (!registrationDate) return (currentStatus as RankStatus) || 'MASTER';

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
    case 'HALL_BLACK': return 'SOVEREIGN FOUNDER';
    case 'MYTHIC': return 'MÍTICO RUBI';
    case 'AMBER': return 'LEGENDÁRIO ÂMBAR';
    case 'LEGENDARY': return 'LENDÁRIO';
    case 'ELITE': return 'MEMBRO ELITE';
    default: return 'MESTRE DO CLUBE';
  }
}

export function getThemeClass(status: string): string {
  switch (status) {
    case 'HALL_BLACK': return 'theme-hallblack';
    case 'MYTHIC': return 'theme-mythic';
    case 'AMBER': return 'theme-amber';
    case 'LEGENDARY': return 'theme-legendary';
    case 'ELITE': return 'theme-elite';
    default: return 'theme-master';
  }
}
