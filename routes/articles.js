const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: ID یکتای مقاله
 *         title:
 *           type: string
 *           description: عنوان مقاله
 *         content:
 *           type: string
 *           description: محتوای مقاله
 *         image:
 *           type: string
 *           description: "آدرس تصویر مقاله (مثال: /public/1.png)"
 *         categoryId:
 *           type: string
 *           description: شناسه دسته‌بندی مقاله
 *         author:
 *           type: string
 *           description: نویسنده مقاله
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاریخ ایجاد مقاله
 */

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: دریافت تمام مقالات
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: false
 *         description: شناسه دسته‌بندی برای فیلتر کردن مقالات
 *     responses:
 *       200:
 *         description: لیست تمام مقالات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 */
router.get('/', articleController.getAllArticles);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: دریافت یک مقاله با شناسه
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه مقاله
 *     responses:
 *       200:
 *         description: اطلاعات مقاله
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: مقاله یافت نشد
 */
router.get('/:id', articleController.getArticleById);

/**
 * @swagger
 * /api/articles/{id}/comments:
 *   get:
 *     summary: دریافت نظرات یک مقاله
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه مقاله
 *     responses:
 *       200:
 *         description: لیست نظرات مقاله
 *       404:
 *         description: مقاله یافت نشد
 */
router.get('/:id/comments', articleController.getArticleComments);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: ایجاد مقاله جدید (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: مقاله با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 */
router.post('/', authenticateToken, requireAdmin, articleController.createArticle);

/**
 * @swagger
 * /api/articles/upload:
 *   post:
 *     summary: آپلود تصویر برای مقاله (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       $ref: '#/components/requestBodies/ImageUpload'
 *     responses:
 *       200:
 *         description: تصویر با موفقیت آپلود شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: تصویر با موفقیت آپلود شد
 *                 imageUrl:
 *                   type: string
 *                   example: /public/1234567890.png
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 */
router.post('/upload', authenticateToken, requireAdmin, articleController.upload.single('image'), articleController.uploadImage);

/**
 * @swagger
 * /api/articles/with-image:
 *   post:
 *     summary: ایجاد مقاله جدید همراه با تصویر (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       $ref: '#/components/requestBodies/ArticleWithImage'
 *     responses:
 *       201:
 *         description: مقاله با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 */
router.post('/with-image', authenticateToken, requireAdmin, articleController.upload.single('image'), articleController.createArticleWithImage);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: بروزرسانی مقاله (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه مقاله
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: مقاله با موفقیت بروزرسانی شد
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 *       404:
 *         description: مقاله یافت نشد
 */
router.put('/:id', authenticateToken, requireAdmin, articleController.updateArticle);

/**
 * @swagger
 * /api/articles/{id}/with-image:
 *   put:
 *     summary: بروزرسانی مقاله همراه با تصویر (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه مقاله
 *     requestBody:
 *       required: true
 *       $ref: '#/components/requestBodies/ArticleWithImage'
 *     responses:
 *       200:
 *         description: مقاله با موفقیت بروزرسانی شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 */
router.put('/:id/with-image', authenticateToken, requireAdmin, articleController.upload.single('image'), articleController.updateArticleWithImage);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: حذف مقاله (فقط ادمین)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه مقاله
 *     responses:
 *       200:
 *         description: مقاله با موفقیت حذف شد
 *       403:
 *         description: فقط ادمین‌ها دسترسی دارند
 *       404:
 *         description: مقاله یافت نشد
 */
router.delete('/:id', authenticateToken, requireAdmin, articleController.deleteArticle);

module.exports = router; 