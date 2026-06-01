CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(255),
  tempat_lahir VARCHAR(255),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  nama_ibu_kandung VARCHAR(255),
  foto_profil TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_first_login BOOLEAN DEFAULT true
);

-- If you are updating an existing table, run this ALTER command:
-- ALTER TABLE students ADD COLUMN is_first_login BOOLEAN DEFAULT true;

-- Insert a sample student for testing
-- The password is 'password123' (hashed via bcrypt)
-- You can generate new bcrypt hashes with any online tool or script
INSERT INTO students (nisn, password, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung) 
VALUES (
  '1234567890', 
  '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash of a known password if you want to test before API registration
  'Budi Santoso', 
  'Jakarta', 
  '2005-08-17', 
  'Laki-laki', 
  'Siti'
) ON CONFLICT (nisn) DO NOTHING;
