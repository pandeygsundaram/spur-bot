import pool from '../config/database';

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Running database migrations...');

    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    console.log('✓ Created conversations table');

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    console.log('✓ Created messages table');

    // Create index on conversation_id for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
      ON messages(conversation_id);
    `);

    console.log('✓ Created indexes');

    // Create index on created_at for sorting
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at
      ON messages(created_at);
    `);

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
