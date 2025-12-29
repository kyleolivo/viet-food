import { sql } from '@vercel/postgres';

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

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS food_entries (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      ingredients TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      user_context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index on user_id for better query performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_food_entries_user_id
    ON food_entries(user_id)
  `;

  // Add new columns if they don't exist (for existing databases)
  try {
    await sql`
      ALTER TABLE food_entries
      ADD COLUMN IF NOT EXISTS ingredients TEXT NOT NULL DEFAULT ''
    `;
  } catch (error) {
    // Column might already exist
    console.log('ingredients column already exists or error adding it:', error);
  }

  try {
    await sql`
      ALTER TABLE food_entries
      ADD COLUMN IF NOT EXISTS user_context TEXT
    `;
  } catch (error) {
    // Column might already exist
    console.log('user_context column already exists or error adding it:', error);
  }
}

export async function getFoodEntries(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ entries: FoodEntry[]; total: number }> {
  const { rows: entries } = await sql<FoodEntry>`
    SELECT * FROM food_entries
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  const { rows: countRows } = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM food_entries
    WHERE user_id = ${userId}
  `;

  const total = parseInt(countRows[0].count, 10);

  return { entries, total };
}

export async function addFoodEntry(
  userId: string,
  name: string,
  description: string,
  ingredients: string[] | string,
  imageUrl: string,
  userContext: string | null = null
): Promise<FoodEntry> {
  // Convert ingredients array to string if needed
  const ingredientsStr = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;

  const { rows } = await sql<FoodEntry>`
    INSERT INTO food_entries (user_id, name, description, ingredients, image_url, user_context)
    VALUES (${userId}, ${name}, ${description}, ${ingredientsStr}, ${imageUrl}, ${userContext})
    RETURNING *
  `;
  return rows[0];
}
