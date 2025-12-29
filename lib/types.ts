export interface IdentificationResult {
  name: string;
  description: string;
  ingredients: string[];
}

export interface FoodEntry {
  id: number;
  user_id: string;
  name: string;
  description: string;
  ingredients: string;
  image_url: string;
  user_context: string | null;
  created_at: Date;
}
