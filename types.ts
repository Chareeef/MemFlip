export interface Flashcard {
  front: string;
  back: string;
}

export type RecallRating = 1 | 2 | 3 | 4;

export const MAX_REVIEW_HISTORY = 50;

export type RatingCounts = Record<RecallRating, number>;

export interface ReviewSession {
  id: string;
  completedAt: number;
  cardCount: number;
  ratingCounts: RatingCounts;
}

export interface ReviewSessionDraft {
  id: string;
  cardCount: number;
  ratingCounts: RatingCounts;
}

export interface FlashcardsDeck {
  flashcardsSet: Flashcard[];
  reviewHistory: ReviewSession[];
}

export interface DeckSummary {
  id: string;
  subject: string;
  createdAt: number | null;
  lastOpenedAt: number | null;
}
