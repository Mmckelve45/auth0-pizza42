/**
 * Seed Script - Populate Pizzas Table
 * Fetches pizzas from the external API and populates the database
 *
 * Usage:
 *   node scripts/seed-pizzas.js
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { sql } from '@vercel/postgres';

const EXTERNAL_API_URL = 'https://react-fast-pizza-api.onrender.com/api';

async function seedPizzas() {
  console.log('🌱 Starting pizza seeding process...\n');

  try {
    // Fetch pizzas from external API
    console.log('📡 Fetching pizzas from external API...');
    const response = await fetch(`${EXTERNAL_API_URL}/menu`);

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }

    const { data: pizzas } = await response.json();
    console.log(`✅ Fetched ${pizzas.length} pizzas\n`);

    // Insert pizzas into database
    console.log('💾 Inserting pizzas into database...');
    let insertedCount = 0;
    let updatedCount = 0;

    for (const pizza of pizzas) {
      try {
        const { rows } = await sql`
          INSERT INTO pizzas (id, name, unit_price, image_url, ingredients, sold_out, created_at, updated_at)
          VALUES (
            ${pizza.id},
            ${pizza.name},
            ${pizza.unitPrice},
            ${pizza.imageUrl || null},
            ${pizza.ingredients ? JSON.stringify(pizza.ingredients) : null},
            ${pizza.soldOut || false},
            NOW(),
            NOW()
          )
          ON CONFLICT (id)
          DO UPDATE SET
            name = ${pizza.name},
            unit_price = ${pizza.unitPrice},
            image_url = ${pizza.imageUrl || null},
            ingredients = ${pizza.ingredients ? JSON.stringify(pizza.ingredients) : null},
            sold_out = ${pizza.soldOut || false},
            updated_at = NOW()
          RETURNING (xmax = 0) AS inserted
        `;

        if (rows[0].inserted) {
          insertedCount++;
          console.log(`  ✓ Inserted: ${pizza.name}`);
        } else {
          updatedCount++;
          console.log(`  ↻ Updated: ${pizza.name}`);
        }
      } catch (error) {
        console.error(`  ✗ Error with ${pizza.name}:`, error.message);
      }
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   ${insertedCount} pizzas inserted`);
    console.log(`   ${updatedCount} pizzas updated`);

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed script
seedPizzas().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});
