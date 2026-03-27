const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  // Database connection string (Pooled / Supavisor)
  // Password Rituraj@1401 is encoded as Rituraj%401401
  const connectionString = 'postgresql://postgres.qouldmulniltsoycwqbe:Rituraj%401401@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to Supabase DB (Pooler) successfully!');

    const schemaPath = path.resolve(__dirname, '../supabase_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing SQL schema...');
    await client.query(sql);
    console.log('Schema executed successfully! Your tables and policies are ready.');
  } catch (err) {
    console.error('Error executing schema:', err.message);
  } finally {
    await client.end();
  }
}

run();
