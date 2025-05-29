const bcrypt = require('bcryptjs');
const { db, createId } = require('../db');
const { generateToken } = require('../middleware/auth');

// ثبت‌نام کاربر جدید
const register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ message: 'نام کاربری، رمز عبور و ایمیل الزامی است' });
    }
    
    // بررسی تکراری نبودن نام کاربری
    const existingUser = db.get('users').find({ username }).value();
    if (existingUser) {
      return res.status(400).json({ message: 'نام کاربری قبلاً استفاده شده است' });
    }
    
    // بررسی تکراری نبودن ایمیل
    const existingEmail = db.get('users').find({ email }).value();
    if (existingEmail) {
      return res.status(400).json({ message: 'ایمیل قبلاً ثبت شده است' });
    }
    
    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: createId(),
      username,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user', // فقط ادمین می‌تواند ادمین جدید ایجاد کند
      createdAt: new Date().toISOString()
    };
    
    db.get('users').push(newUser).write();
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      message: 'کاربر با موفقیت ثبت شد',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ثبت‌نام کاربر', error: error.message });
  }
};

// ورود کاربر
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    }
    
    // یافتن کاربر
    const user = db.get('users').find({ username }).value();
    if (!user) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }
    
    // بررسی رمز عبور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
    }
    
    // تولید توکن
    const token = generateToken(user);
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userResponse } = user;
    
    res.json({
      message: 'ورود موفقیت‌آمیز',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ورود', error: error.message });
  }
};

// دریافت اطلاعات کاربر فعلی
const getProfile = (req, res) => {
  try {
    const user = db.get('users').find({ id: req.user.id }).value();
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userResponse } = user;
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت اطلاعات کاربر', error: error.message });
  }
};

// دریافت تمام کاربران (فقط ادمین)
const getAllUsers = (req, res) => {
  try {
    const users = db.get('users').map(user => {
      const { password: _, ...userResponse } = user;
      return userResponse;
    }).value();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت کاربران', error: error.message });
  }
};

// تغییر نقش کاربر (فقط ادمین)
const updateUserRole = (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'نقش معتبر نیست' });
    }
    
    const user = db.get('users').find({ id: userId }).value();
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    // جلوگیری از تغییر نقش خود
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'نمی‌توانید نقش خود را تغییر دهید' });
    }
    
    const updatedUser = { ...user, role };
    db.get('users').find({ id: userId }).assign(updatedUser).write();
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userResponse } = updatedUser;
    
    res.json({
      message: 'نقش کاربر با موفقیت تغییر یافت',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در تغییر نقش کاربر', error: error.message });
  }
};

// حذف کاربر (فقط ادمین)
const deleteUser = (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = db.get('users').find({ id: userId }).value();
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    
    // جلوگیری از حذف خود
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'نمی‌توانید خود را حذف کنید' });
    }
    
    db.get('users').remove({ id: userId }).write();
    
    res.json({ message: 'کاربر با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف کاربر', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers,
  updateUserRole,
  deleteUser
}; 