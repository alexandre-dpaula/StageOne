import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const client = new Client({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.tzdraygdkeudxgtpoetp',
  password: 'Aa160201!',
  ssl: { rejectUnauthorized: false }
});

async function createTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sql = fs.readFileSync('create-webhook-events-table.sql', 'utf8');

    console.log('Executing SQL...');
    await client.query(sql);

    console.log('✅ Tabela criada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

createTable();
