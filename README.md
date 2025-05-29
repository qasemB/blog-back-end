# وبلاگ فارسی API

یک API کامل برای وبلاگ فارسی با قابلیت‌های احراز هویت، مدیریت نقش‌ها و عملیات CRUD.

## ویژگی‌ها

- 🔐 **احراز هویت JWT**: سیستم امن ورود و ثبت‌نام
- 👥 **مدیریت نقش‌ها**: نقش‌های کاربر عادی و ادمین
- 📝 **مدیریت مقالات**: ایجاد، ویرایش، حذف و مشاهده مقالات
- 📂 **دسته‌بندی‌ها**: سازماندهی مقالات در دسته‌بندی‌های مختلف
- 💬 **سیستم نظرات**: امکان نظردهی روی مقالات
- 🖼️ **آپلود تصویر**: آپلود تصاویر برای مقالات
- 📚 **مستندات Swagger**: مستندات کامل API

## نصب و راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
npm install
```

### 2. ایجاد ادمین پیش‌فرض
```bash
node scripts/createAdmin.js
```

### 3. اجرای سرور
```bash
npm start
```

سرور روی پورت 4004 اجرا می‌شود: `http://localhost:4004`

## اطلاعات ادمین پیش‌فرض

- **نام کاربری**: `admin`
- **ایمیل**: `admin@blog.com`
- **رمز عبور**: `admin123`

⚠️ **توجه**: حتماً پس از اولین ورود، رمز عبور را تغییر دهید!

## استفاده از API

### احراز هویت

#### ثبت‌نام کاربر جدید
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123",
  "role": "user"
}
```

#### ورود
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

پاسخ شامل token است که باید در header درخواست‌های بعدی استفاده شود:
```json
{
  "message": "ورود موفقیت‌آمیز",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "username": "admin",
    "email": "admin@blog.com",
    "role": "admin"
  }
}
```

### استفاده از Token

برای درخواست‌هایی که نیاز به احراز هویت دارند، token را در header اضافه کنید:

```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

## مجوزهای دسترسی

### عملیات عمومی (بدون نیاز به ورود)
- مشاهده مقالات: `GET /api/articles`
- مشاهده دسته‌بندی‌ها: `GET /api/categories`
- مشاهده نظرات: `GET /api/comments`

### عملیات کاربران لاگین شده
- ایجاد نظر: `POST /api/comments`
- ویرایش نظر خود: `PUT /api/comments/:id`
- حذف نظر خود: `DELETE /api/comments/:id`

### عملیات ادمین‌ها فقط
- ایجاد مقاله: `POST /api/articles`
- ویرایش مقاله: `PUT /api/articles/:id`
- حذف مقاله: `DELETE /api/articles/:id`
- ایجاد دسته‌بندی: `POST /api/categories`
- ویرایش دسته‌بندی: `PUT /api/categories/:id`
- حذف دسته‌بندی: `DELETE /api/categories/:id`
- مدیریت کاربران: `/api/auth/users/*`

## نمونه‌های استفاده

### ایجاد مقاله (فقط ادمین)
```bash
POST /api/articles
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "عنوان مقاله",
  "content": "محتوای مقاله...",
  "categoryId": "category_id",
  "author": "نام نویسنده"
}
```

### ایجاد نظر (کاربران لاگین شده)
```bash
POST /api/comments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "content": "این یک نظر تستی است",
  "articleId": "article_id"
}
```

### آپلود تصویر برای مقاله (فقط ادمین)
```bash
POST /api/articles/with-image
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data

title: عنوان مقاله
content: محتوای مقاله
image: [فایل تصویر]
categoryId: category_id
author: نام نویسنده
```

## مستندات API

مستندات کامل Swagger در آدرس زیر در دسترس است:
```
http://localhost:4004/api-docs
```

## ساختار پروژه

```
├── controllers/          # منطق تجاری
│   ├── authController.js
│   ├── articleController.js
│   ├── categoryController.js
│   └── commentController.js
├── middleware/           # میان‌افزارها
│   └── auth.js
├── routes/              # تعریف مسیرها
│   ├── auth.js
│   ├── articles.js
│   ├── categories.js
│   └── comments.js
├── scripts/             # اسکریپت‌های کمکی
│   └── createAdmin.js
├── public/              # فایل‌های استاتیک
├── db.js               # تنظیمات پایگاه داده
├── server.js           # فایل اصلی سرور
└── db.json            # پایگاه داده JSON
```

## متغیرهای محیطی

می‌توانید متغیرهای زیر را تنظیم کنید:

```env
PORT=4004
JWT_SECRET=your-secret-key-here
```

## نکات امنیتی

1. **تغییر JWT Secret**: در محیط تولید حتماً `JWT_SECRET` را تغییر دهید
2. **تغییر رمز ادمین**: پس از اولین ورود، رمز عبور ادمین را تغییر دهید
3. **HTTPS**: در محیط تولید از HTTPS استفاده کنید
4. **Rate Limiting**: برای جلوگیری از حملات، rate limiting اضافه کنید

## مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. 
