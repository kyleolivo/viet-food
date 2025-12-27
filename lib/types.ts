export interface IdentificationResult {
  name: string;
  description: string;
}

export interface FoodEntry {
  id: number;
  user_id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
}
