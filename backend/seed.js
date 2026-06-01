const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seed() {
  try {
    const nisn = '1234567890';
    const dob = '15082005'; // Default password (DDMMYYYY)
    
    console.log(`Seeding student with NISN: ${nisn} and DOB Password: ${dob}`);
    
    const hashedPassword = await bcrypt.hash(dob, 10);
    
    await pool.query(
      `INSERT INTO students 
        (nisn, password, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, is_first_login) 
       VALUES 
        ($1, $2, 'Siswa Teladan', 'Bandung', '2005-08-15', 'Laki-laki', 'Siti', true) 
       ON CONFLICT (nisn) DO NOTHING`,
       [nisn, hashedPassword]
    );
    
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    pool.end();
  }
}

seed();
