const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?');
    const existing = checkStmt.get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A user with this email address is already registered.' });
    }

    // Role is strictly citizen for public registration
    // (Registrar accounts can only be seeded/provisioned securely)
    const role = 'citizen';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertStmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insertStmt.run(name.trim(), cleanEmail, passwordHash, role, phone ? phone.trim() : null);

    const userId = result.lastInsertRowid;

    // Log registration activity
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(userId, 'CITIZEN_REGISTERED', null);

    const token = jwt.sign(
      { id: userId, email: cleanEmail, role: role, name: name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: role,
        phone: phone || null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(cleanEmail);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log login activity
    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(user.id, 'USER_LOGIN', null);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    const stmt = db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?');
    stmt.run(name.trim(), phone ? phone.trim() : null, req.user.id);

    const logStmt = db.prepare('INSERT INTO activity_logs (user_id, action, land_id) VALUES (?, ?, ?)');
    logStmt.run(req.user.id, 'PROFILE_UPDATED', null);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        ...req.user,
        name: name.trim(),
        phone: phone ? phone.trim() : null
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.checkUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email query parameter is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stmt = db.prepare('SELECT id, name, email, role FROM users WHERE email = ?');
    const targetUser = stmt.get(cleanEmail);

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'No citizen found with this email address.' });
    }

    res.json({
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

