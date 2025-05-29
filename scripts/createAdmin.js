const bcrypt = require('bcryptjs');
const { db, createId } = require('../db');

// اطلاعات ادمین پیش‌فرض
const adminData = {
  username: 'admin',
  email: 'admin@blog.com',
  password: 'admin123',
  role: 'admin'
};

async function createAdmin() {
  try {
    // بررسی اینکه آیا ادمین وجود دارد
    const existingAdmin = db.get('users').find({ username: adminData.username }).value();
    
    if (existingAdmin) {
      console.log('❌ ادمین قبلاً ایجاد شده است');
      return;
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // ایجاد ادمین جدید
    const admin = {
      id: createId(),
      username: adminData.username,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
      createdAt: new Date().toISOString()
    };

    // اضافه کردن به پایگاه داده
    db.get('users').push(admin).write();

    console.log('✅ ادمین پیش‌فرض با موفقیت ایجاد شد:');
    console.log(`   نام کاربری: ${adminData.username}`);
    console.log(`   ایمیل: ${adminData.email}`);
    console.log(`   رمز عبور: ${adminData.password}`);
    console.log(`   نقش: ${adminData.role}`);
    console.log('\n⚠️  توجه: حتماً رمز عبور را تغییر دهید!');
    
  } catch (error) {
    console.error('❌ خطا در ایجاد ادمین:', error.message);
  }
}

// اجرای اسکریپت
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin; 