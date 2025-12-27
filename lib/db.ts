import { sql } from '@vercel/postgres';

export interface FoodEntry {
  id: number;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
}

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS food_entries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function getFoodEntries(): Promise<FoodEntry[]> {
  const { rows } = await sql<FoodEntry>`
    SELECT * FROM food_entries
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function addFoodEntry(
  name: string,
  description: string,
  imageUrl: string
): Promise<FoodEntry> {
  const { rows } = await sql<FoodEntry>`
    INSERT INTO food_entries (name, description, image_url)
    VALUES (${name}, ${description}, ${imageUrl})
    RETURNING *
  `;
  return rows[0];
}
