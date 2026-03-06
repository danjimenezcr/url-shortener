export interface Visit {
  _id: string;
  urlId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface UrlStatistics {
  urlId: string;
  totalVisits: number;
  visits: Visit[];
  dailyBreakdown: Record<string, number>;
  countries: CountryCount[];
  chart: ChartData;
}