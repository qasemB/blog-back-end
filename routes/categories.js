const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: ID یکتای دسته‌بندی
 *         title:
 *           type: string
 *           description: عنوان دسته‌بندی
 *         description:
 *           type: string
 *           description: توضیحات دسته‌بندی
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: دریافت تمام دسته‌بندی‌ها
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: لیست تمام دسته‌بندی‌ها
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: دریافت یک دسته‌بندی با شناسه
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه دسته‌بندی
 *     responses:
 *       200:
 *         description: اطلاعات دسته‌بندی
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: دسته‌بندی یافت نشد
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories/{id}/articles:
 *   get:
 *     summary: دریافت مقالات مرتبط با یک دسته‌بندی
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه دسته‌بندی
 *     responses:
 *       200:
 *         description: لیست مقالات مرتبط با دسته‌بندی
 *       404:
 *         description: دسته‌بندی یافت نشد
 */
router.get('/:id/articles', categoryController.getCategoryArticles);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: ایجاد دسته‌بندی جدید
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: دسته‌بندی با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 */
router.post('/', categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: بروزرسانی دسته‌بندی
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه دسته‌بندی
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: دسته‌بندی با موفقیت بروزرسانی شد
 *       404:
 *         description: دسته‌بندی یافت نشد
 */
router.put('/:id', categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: حذف دسته‌بندی
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه دسته‌بندی
 *     responses:
 *       200:
 *         description: دسته‌بندی با موفقیت حذف شد
 *       404:
 *         description: دسته‌بندی یافت نشد
 *       400:
 *         description: امکان حذف وجود ندارد (مقالاتی به این دسته‌بندی وابسته هستند)
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router; 