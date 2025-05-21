const express = require('express');
const router = express.Router();
const { db, createId } = require('../db');

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
router.get('/', (req, res) => {
  const comments = db.get('comments').value();
  res.json(comments);
});

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
router.get('/:id', (req, res) => {
  const comment = db.get('comments').find({ id: req.params.id }).value();
  
  if (!comment) {
    return res.status(404).json({ message: 'نظر یافت نشد' });
  }
  
  res.json(comment);
});

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
router.post('/', (req, res) => {
  const { content, articleId, author } = req.body;
  
  if (!content || !articleId) {
    return res.status(400).json({ message: 'محتوای نظر و شناسه مقاله الزامی است' });
  }
  
  // Check if article exists
  const article = db.get('articles').find({ id: articleId }).value();
  if (!article) {
    return res.status(400).json({ message: 'مقاله مورد نظر یافت نشد' });
  }
  
  const newComment = {
    id: createId(),
    content,
    articleId,
    author: author || 'ناشناس',
    createdAt: new Date().toISOString()
  };
  
  db.get('comments').push(newComment).write();
  
  res.status(201).json(newComment);
});

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
router.put('/:id', (req, res) => {
  const { content, author } = req.body;
  
  const comment = db.get('comments').find({ id: req.params.id }).value();
  
  if (!comment) {
    return res.status(404).json({ message: 'نظر یافت نشد' });
  }
  
  const updatedComment = {
    ...comment,
    content: content !== undefined ? content : comment.content,
    author: author !== undefined ? author : comment.author
  };
  
  db.get('comments').find({ id: req.params.id }).assign(updatedComment).write();
  
  res.json(updatedComment);
});

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
router.delete('/:id', (req, res) => {
  const comment = db.get('comments').find({ id: req.params.id }).value();
  
  if (!comment) {
    return res.status(404).json({ message: 'نظر یافت نشد' });
  }
  
  db.get('comments').remove({ id: req.params.id }).write();
  
  res.json({ message: 'نظر با موفقیت حذف شد' });
});

module.exports = router; 