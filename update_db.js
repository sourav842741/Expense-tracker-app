if (process.loadEnvFile) {
  process.loadEnvFile('.env');
}

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully!');
  
  // Add password_hash and pin_code columns to profiles
  await client.query(`
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin_code TEXT;
    ALTER TABLE public.payment_plans ADD COLUMN IF NOT EXISTS user_id TEXT;
    ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS user_id TEXT;
    ALTER TABLE public.savings_goals ADD COLUMN IF NOT EXISTS user_id TEXT;
  `);
  console.log('Columns verified/added successfully!');

  // Set default PIN 1234 for existing profiles so PIN login immediately finds them
  await client.query(`
    UPDATE public.profiles SET pin_code = '1234' WHERE pin_code IS NULL;
  `);
  console.log('Set default pin_code = 1234 for existing profiles!');

  const updatedProfiles = await client.query('SELECT id, name, email, pin_code FROM public.profiles;');
  console.log('Updated Profiles in DB:', updatedProfiles.rows);

  await client.end();
}

main().catch(err => {
  console.error('DB Error:', err);
  process.exit(1);
});
