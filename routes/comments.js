const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - articleId
 *       properties:
 *         id:
 *           type: string
 *           description: ID یکتای نظر
 *         content:
 *           type: string
 *           description: محتوای نظر
 *         articleId:
 *           type: string
 *           description: شناسه مقاله مرتبط
 *         author:
 *           type: string
 *           description: نویسنده نظر
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: تاریخ ایجاد نظر
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: دریافت تمام نظرات
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: لیست تمام نظرات
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/', commentController.getAllComments);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: دریافت یک نظر با شناسه
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه نظر
 *     responses:
 *       200:
 *         description: اطلاعات نظر
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: نظر یافت نشد
 */
router.get('/:id', commentController.getCommentById);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: ایجاد نظر جدید
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *             properties:
 *               content:
 *                 type: string
 *               articleId:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: نظر با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post('/', commentController.createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: بروزرسانی نظر
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه نظر
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: نظر با موفقیت بروزرسانی شد
 *       404:
 *         description: نظر یافت نشد
 */
router.put('/:id', commentController.updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: حذف نظر
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: شناسه نظر
 *     responses:
 *       200:
 *         description: نظر با موفقیت حذف شد
 *       404:
 *         description: نظر یافت نشد
 */
router.delete('/:id', commentController.deleteComment);

module.exports = router; 