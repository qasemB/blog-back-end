const jwt = require('jsonwebtoken');
const { db } = require('../db');

// کلید مخفی JWT (در تولید باید از متغیر محیطی استفاده شود)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-blog-api-2024';

// Middleware برای احراز هویت
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'توکن دسترسی الزامی است' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'توکن نامعتبر است' });
    }
    
    // بررسی وجود کاربر در پایگاه داده
    const currentUser = db.get('users').find({ id: user.id }).value();
    if (!currentUser) {
      return res.status(403).json({ message: 'کاربر یافت نشد' });
    }

    req.user = user;
    next();
  });
};

// Middleware برای بررسی نقش ادمین
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'ابتدا وارد شوید' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'فقط ادمین‌ها به این بخش دسترسی دارند' });
  }

  next();
};

// Middleware برای بررسی نقش کاربر عادی یا ادمین
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'ابتدا وارد شوید' });
  }

  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'دسترسی مجاز نیست' });
  }

  next();
};

// تولید توکن JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireUser,
  generateToken,
  JWT_SECRET
};