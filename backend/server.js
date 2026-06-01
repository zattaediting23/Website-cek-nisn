const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Allow larger payload for base64 image

// Database Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API ROUTES

// 1. Login
app.post('/api/auth/login', async (req, res) => {
  const { nisn, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM students WHERE nisn = $1', [nisn]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'NISN tidak ditemukan' });
    }

    const student = result.rows[0];
    const validPassword = await bcrypt.compare(password, student.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Password salah' });
    }

    if (student.is_first_login) {
      const tempToken = jwt.sign(
        { id: student.id, nisn: student.nisn, temp: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      return res.json({ requirePasswordChange: true, tempToken, message: 'Silakan ubah password default Anda' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: student.id, nisn: student.nisn },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, message: 'Login berhasil' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1b. Change Password
app.post('/api/auth/change-password', async (req, res) => {
  const { tempToken, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Password tidak cocok' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password minimal 8 karakter' });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.temp) {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE students SET password = $1, is_first_login = false WHERE id = $2',
      [hashedPassword, decoded.id]
    );

    const finalToken = jwt.sign(
      { id: decoded.id, nisn: decoded.nisn },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token: finalToken, message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(403).json({ error: 'Token kadaluarsa atau tidak valid' });
  }
});

// 2. Get Profile
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, is_verified FROM students WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Update Profile
app.put('/api/student/update', authenticateToken, async (req, res) => {
  const { nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil } = req.body;

  try {
    // Note: In a real app, you would validate the inputs here

    await pool.query(
      `UPDATE students 
       SET nama_lengkap = $1, 
           tempat_lahir = $2, 
           tanggal_lahir = $3, 
           jenis_kelamin = $4, 
           nama_ibu_kandung = $5, 
           foto_profil = $6,
           is_verified = false
       WHERE id = $7`,
      [nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, req.user.id]
    );

    res.json({ message: 'Profile updated successfully. Data is pending verification.' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Utility Route to seed user if doesn't exist (Only for initial local dev!)
app.post('/api/auth/register-default', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('su123', 10);
    await pool.query(
      `INSERT INTO students (nisn, password, nama_lengkap) 
       VALUES ('default', $1, 'Admin Default') 
       ON CONFLICT (nisn) DO NOTHING`,
       [hashedPassword]
    );
    res.json({ message: 'Default user ensured (nisn: default, pw: su123)' });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
