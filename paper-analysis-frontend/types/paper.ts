export interface Paper {
  title: string;
  snippet: string;
  highlights: string[];
  link: string;
}

export interface FeatureAnalysis {
  feature: string;
  count: number;
  percentage: number;
}

export interface VisualizationData {
  labels: string[];
  values: number[];
  percentages: number[];
}

export interface PaperAnalysisResponse {
  status: string;
  data: {
    totalPapersAnalyzed: number;
    featureAnalysis: FeatureAnalysis[];
    visualizationData: VisualizationData;
    papers: Paper[];
  };
}
