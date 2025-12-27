import { sql } from '@vercel/postgres';

export interface FoodEntry {
  id: number;
  user_id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: Date;
}

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS food_entries (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index on user_id for better query performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_food_entries_user_id
    ON food_entries(user_id)
  `;
}

export async function getFoodEntries(userId: string): Promise<FoodEntry[]> {
  const { rows } = await sql<FoodEntry>`
    SELECT * FROM food_entries
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function addFoodEntry(
  userId: string,
  name: string,
  description: string,
  imageUrl: string
): Promise<FoodEntry> {
  const { rows } = await sql<FoodEntry>`
    INSERT INTO food_entries (user_id, name, description, image_url)
    VALUES (${userId}, ${name}, ${description}, ${imageUrl})
    RETURNING *
  `;
  return rows[0];
}
