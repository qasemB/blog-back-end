const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID یکتای کاربر
 *         username:
 *           type: string
 *           description: نام کاربری
 *         email:
 *           type: string
 *           description: ایمیل کاربر
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: نقش کاربر
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاریخ ایجاد حساب
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: ثبت‌نام کاربر جدید
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: کاربر با موفقیت ثبت شد
 *       400:
 *         description: خطا در اطلاعات ورودی
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: ورود کاربر
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: ورود موفقیت‌آمیز
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: نام کاربری یا رمز عبور اشتباه
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: دریافت اطلاعات کاربر فعلی
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: اطلاعات کاربر
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: توکن دسترسی الزامی است
 *       403:
 *         description: توکن نامعتبر است
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: دریافت تمام کاربران (فقط ادمین)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: لیست تمام کاربران
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 */
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   put:
 *     summary: تغییر نقش کاربر (فقط ادمین)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه کاربر
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: نقش کاربر با موفقیت تغییر یافت
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 *       404:
 *         description: کاربر یافت نشد
 */
router.put('/users/:id/role', authenticateToken, requireAdmin, authController.updateUserRole);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   delete:
 *     summary: حذف کاربر (فقط ادمین)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه کاربر
 *     responses:
 *       200:
 *         description: کاربر با موفقیت حذف شد
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 *       404:
 *         description: کاربر یافت نشد
 */
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);

module.exports = router; 