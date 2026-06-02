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
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Allow larger payload for base64 image

// Database Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Auto-migrate: Ensure column exists (safe to run multiple times)
pool.query(`
  ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS foto_profil_gm TEXT;
`).catch(err => console.error("Auto-migration error (can be ignored):", err.message));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied, token missing' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for Admin (runs AFTER authenticateToken)
const requireAdmin = (req, res, next) => {
  if (req.user.nisn !== 'admin') {
    return res.status(403).json({ error: 'Access denied, admin only' });
  }
  next();
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

    res.json({ token, message: 'Login berhasil', role: student.nisn === 'admin' ? 'admin' : 'student' });
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

// 1c. Reset Password (Forgot Password)
app.post('/api/auth/reset-password', async (req, res) => {
  const nisn = req.body.nisn?.trim();
  const tanggal_lahir = req.body.tanggal_lahir?.trim();
  console.log('--- RESET PASSWORD ATTEMPT ---');
  console.log('Body:', req.body);
  console.log('NISN:', nisn, 'Tanggal Lahir:', tanggal_lahir);

  try {
    const result = await pool.query('SELECT * FROM students WHERE nisn = $1 AND tanggal_lahir::text LIKE $2 || \'%\'', [nisn, tanggal_lahir]);
    console.log('Query result rows:', result.rows.length);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Data NISN atau Tanggal Lahir tidak cocok' });
    }

    const student = result.rows[0];
    
    // Format tanggal_lahir from YYYY-MM-DD to DDMMYYYY
    const d = new Date(tanggal_lahir);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear());
    const defaultPassword = `${day}${month}${year}`;

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      'UPDATE students SET password = $1, is_first_login = true WHERE id = $2',
      [hashedPassword, student.id]
    );

    // Return the new password so the frontend can display it
    res.json({ 
      message: 'Password berhasil direset! Silakan login kembali dengan password baru ini.',
      newPassword: defaultPassword
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// 2. Get Profile
app.get('/api/student/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, is_verified, verification_status, rejection_reason FROM students WHERE id = $1',
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
  const { nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, foto_profil_gm } = req.body;

  try {
    const isAdmin = req.user.nisn === 'admin';

    await pool.query(
      `UPDATE students 
       SET nama_lengkap = $1, 
           tempat_lahir = $2, 
           tanggal_lahir = $3, 
           jenis_kelamin = $4, 
           nama_ibu_kandung = $5, 
           foto_profil = $6,
           foto_profil_gm = $7,
           is_verified = $8,
           verification_status = $9,
           rejection_reason = NULL
       WHERE id = $10`,
      [nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, foto_profil_gm, isAdmin ? true : false, isAdmin ? 'verified' : 'pending', req.user.id]
    );

    res.json({ message: isAdmin ? 'Profile updated successfully.' : 'Profile updated successfully. Data is pending verification.' });
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
});

// --- ADMIN ROUTES ---
app.get('/api/admin/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nama_ibu_kandung, foto_profil, foto_profil_gm FROM students WHERE verification_status = 'pending' AND nisn != 'admin'"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch pending students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/verify/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      "UPDATE students SET is_verified = true, verification_status = 'verified', rejection_reason = NULL WHERE id = $1",
      [req.params.id]
    );
    res.json({ message: 'Student verified successfully' });
  } catch (error) {
    console.error('Verify student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/reject/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query(
      "UPDATE students SET is_verified = false, verification_status = 'rejected', rejection_reason = $1 WHERE id = $2",
      [reason || 'Data ditolak oleh admin. Silakan periksa kembali data Anda.', req.params.id]
    );
    res.json({ message: 'Student rejected successfully' });
  } catch (error) {
    console.error('Reject student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
