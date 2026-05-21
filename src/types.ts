export interface ReviewPoint {
  title: string;
  explanation: string;
  lineReference?: string;
}

export interface PRReviewData {
  summary: string;
  reactBestPractices: ReviewPoint[];
  maintainability: ReviewPoint[];
  reusability: ReviewPoint[];
  performanceNotes: ReviewPoint[];
  uiUxSuggestions: ReviewPoint[];
  accessibilityNotes: ReviewPoint[];
  improvedCode: string;
  improvementExplanation: string;
}

export interface PastReview {
  id: string;
  timestamp: string;
  title: string;
  code: string;
  language: string;
  context?: string;
  review: PRReviewData;
}
