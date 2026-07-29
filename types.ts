export interface Flashcard {
  front: string;
  back: string;
}

export interface DeckSummary {
  id: string;
  subject: string;
  createdAt: number | null;
  lastOpenedAt: number | null;
}
