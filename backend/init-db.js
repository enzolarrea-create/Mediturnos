/**
 * Script para inicializar la base de datos
 * Ejecutar una sola vez después de crear la DB en Render
 */

const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render') ? { rejectUnauthorized: false } : false
});

async function init() {
  try {
    console.log('📊 Inicializando base de datos...');
    const sql = fs.readFileSync('./database.sql', 'utf8');
    
    // Ejecutar cada statement por separado
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignorar errores de "already exists"
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.error('Error ejecutando statement:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

init();

