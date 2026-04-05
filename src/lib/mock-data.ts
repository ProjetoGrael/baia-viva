// Mock data for the application until backend is connected

export interface CollectionPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface ScientificRecord {
  id: string;
  pointId: string;
  pointName: string;
  date: string;
  waterColor: string;
  waterOdor: string;
  turbidity: string;
  trashType: string;
  trashQuantity: string;
  windDirection: string;
  weather: string;
  lat: number;
  lng: number;
  collector: string;
  notes: string;
}

export interface CommunityReport {
  id: string;
  type: 'floating_trash' | 'sick_animal' | 'water_stain' | 'odor' | 'other';
  lat: number;
  lng: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reporterName: string;
  mediaUrl?: string;
}

export const COLLECTION_POINTS: CollectionPoint[] = [
  { id: '1', name: 'Praia de Botafogo', lat: -22.9494, lng: -43.1822, description: 'Ponto próximo ao Aterro do Flamengo' },
  { id: '2', name: 'Ilha de Paquetá', lat: -22.7597, lng: -43.1100, description: 'Pier principal da ilha' },
  { id: '3', name: 'Praia de Icaraí', lat: -22.9050, lng: -43.1100, description: 'Extremidade sul da praia' },
  { id: '4', name: 'Ilha do Governador', lat: -22.8167, lng: -43.2000, description: 'Praia da Bica' },
  { id: '5', name: 'São Gonçalo', lat: -22.8269, lng: -43.0634, description: 'Praia das Pedrinhas' },
  { id: '6', name: 'Praia de Jurujuba', lat: -22.9350, lng: -43.0950, description: 'Área de pescadores' },
];

export const SCIENTIFIC_RECORDS: ScientificRecord[] = [
  { id: '1', pointId: '1', pointName: 'Praia de Botafogo', date: '2026-03-15', waterColor: 'Verde-escuro', waterOdor: 'Moderado', turbidity: 'Alta', trashType: 'Plástico', trashQuantity: 'Abundante', windDirection: 'Sudeste', weather: 'Ensolarado', lat: -22.9494, lng: -43.1822, collector: 'Prof. Silva', notes: 'Presença de microplástico' },
  { id: '2', pointId: '2', pointName: 'Ilha de Paquetá', date: '2026-03-16', waterColor: 'Verde-claro', waterOdor: 'Leve', turbidity: 'Média', trashType: 'Orgânico', trashQuantity: 'Pouco', windDirection: 'Norte', weather: 'Nublado', lat: -22.7597, lng: -43.1100, collector: 'Prof. Santos', notes: 'Água melhor que mês anterior' },
  { id: '3', pointId: '3', pointName: 'Praia de Icaraí', date: '2026-03-17', waterColor: 'Marrom', waterOdor: 'Forte', turbidity: 'Muito alta', trashType: 'Misto', trashQuantity: 'Abundante', windDirection: 'Leste', weather: 'Chuvoso', lat: -22.9050, lng: -43.1100, collector: 'Aluno João', notes: 'Esgoto visível após chuva' },
  { id: '4', pointId: '4', pointName: 'Ilha do Governador', date: '2026-03-18', waterColor: 'Verde', waterOdor: 'Moderado', turbidity: 'Alta', trashType: 'Plástico', trashQuantity: 'Moderado', windDirection: 'Sul', weather: 'Ensolarado', lat: -22.8167, lng: -43.2000, collector: 'Prof. Lima', notes: 'Garrafas PET encontradas' },
  { id: '5', pointId: '1', pointName: 'Praia de Botafogo', date: '2026-03-20', waterColor: 'Verde-escuro', waterOdor: 'Forte', turbidity: 'Muito alta', trashType: 'Misto', trashQuantity: 'Abundante', windDirection: 'Sudoeste', weather: 'Chuvoso', lat: -22.9494, lng: -43.1822, collector: 'Prof. Silva', notes: 'Após temporal' },
  { id: '6', pointId: '5', pointName: 'São Gonçalo', date: '2026-03-22', waterColor: 'Marrom', waterOdor: 'Muito forte', turbidity: 'Muito alta', trashType: 'Esgoto', trashQuantity: 'N/A', windDirection: 'Norte', weather: 'Ensolarado', lat: -22.8269, lng: -43.0634, collector: 'Aluno Maria', notes: 'Ponto crítico de esgoto in natura' },
];

export const COMMUNITY_REPORTS: CommunityReport[] = [
  { id: '1', type: 'floating_trash', lat: -22.9300, lng: -43.1700, description: 'Grande acúmulo de garrafas plásticas próximo à marina', status: 'approved', createdAt: '2026-03-20', reporterName: 'Carlos M.' },
  { id: '2', type: 'sick_animal', lat: -22.8800, lng: -43.1300, description: 'Tartaruga marinha aparentemente debilitada na praia', status: 'approved', createdAt: '2026-03-21', reporterName: 'Ana P.' },
  { id: '3', type: 'water_stain', lat: -22.9100, lng: -43.1500, description: 'Mancha escura se espalhando pela superfície da água', status: 'pending', createdAt: '2026-03-22', reporterName: 'Roberto S.' },
  { id: '4', type: 'odor', lat: -22.8500, lng: -43.1200, description: 'Forte odor de esgoto vindo da baía', status: 'approved', createdAt: '2026-03-23', reporterName: 'Lucia F.' },
  { id: '5', type: 'floating_trash', lat: -22.7800, lng: -43.1050, description: 'Isopor e sacolas plásticas perto de Paquetá', status: 'approved', createdAt: '2026-03-25', reporterName: 'Pedro R.' },
];

export const REPORT_TYPE_LABELS: Record<CommunityReport['type'], string> = {
  floating_trash: 'Lixo Flutuante',
  sick_animal: 'Animal Doente',
  water_stain: 'Mancha na Água',
  odor: 'Odor Forte',
  other: 'Outro',
};

export const REPORT_TYPE_COLORS: Record<CommunityReport['type'], string> = {
  floating_trash: '#e67e22',
  sick_animal: '#e74c3c',
  water_stain: '#8e44ad',
  odor: '#f39c12',
  other: '#95a5a6',
};

// Dashboard aggregation helpers
export function getTrashByType() {
  const counts: Record<string, number> = {};
  SCIENTIFIC_RECORDS.forEach(r => {
    counts[r.trashType] = (counts[r.trashType] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getWaterQualityByPoint() {
  const turbidityScore: Record<string, number> = {
    'Baixa': 1, 'Média': 2, 'Alta': 3, 'Muito alta': 4,
  };
  return COLLECTION_POINTS.map(p => {
    const records = SCIENTIFIC_RECORDS.filter(r => r.pointId === p.id);
    const avg = records.length > 0
      ? records.reduce((sum, r) => sum + (turbidityScore[r.turbidity] || 2), 0) / records.length
      : 0;
    return { name: p.name.replace('Praia de ', ''), turbidity: avg, records: records.length };
  }).filter(p => p.records > 0);
}

export function getWeatherDistribution() {
  const counts: Record<string, number> = {};
  SCIENTIFIC_RECORDS.forEach(r => {
    counts[r.weather] = (counts[r.weather] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getCommunityReportsByType() {
  const counts: Record<string, number> = {};
  COMMUNITY_REPORTS.forEach(r => {
    counts[REPORT_TYPE_LABELS[r.type]] = (counts[REPORT_TYPE_LABELS[r.type]] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
