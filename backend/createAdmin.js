const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO students (nisn, password, nama_lengkap, is_first_login, is_verified) 
       VALUES ('admin', $1, 'Administrator', false, true) 
       ON CONFLICT (nisn) DO UPDATE SET password = EXCLUDED.password`,
      [hashedPassword]
    );
    console.log('User admin created successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
createAdmin();
