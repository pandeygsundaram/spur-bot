import pool from '../config/database';

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Seeding database...');

    // The FAQ data will be used in the system prompt for the LLM
    // We're not creating a separate FAQ table since the assignment
    // allows hardcoding this in the prompt

    console.log('✓ Seed data prepared (FAQ knowledge will be in system prompt)');
    console.log('✓ Database is ready!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
