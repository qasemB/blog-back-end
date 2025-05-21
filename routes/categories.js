const express = require('express');
const router = express.Router();
const { db, createId } = require('../db');

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
router.get('/', (req, res) => {
  const categories = db.get('categories').value();
  res.json(categories);
});

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
router.get('/:id', (req, res) => {
  const category = db.get('categories').find({ id: req.params.id }).value();
  
  if (!category) {
    return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
  }
  
  res.json(category);
});

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
router.get('/:id/articles', (req, res) => {
  const category = db.get('categories').find({ id: req.params.id }).value();
  
  if (!category) {
    return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
  }
  
  const articles = db.get('articles').filter({ categoryId: req.params.id }).value();
  res.json(articles);
});

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
router.post('/', (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'عنوان دسته‌بندی الزامی است' });
  }
  
  const newCategory = {
    id: createId(),
    title,
    description: description || ''
  };
  
  db.get('categories').push(newCategory).write();
  
  res.status(201).json(newCategory);
});

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
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  
  const category = db.get('categories').find({ id: req.params.id }).value();
  
  if (!category) {
    return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
  }
  
  const updatedCategory = {
    ...category,
    title: title !== undefined ? title : category.title,
    description: description !== undefined ? description : category.description
  };
  
  db.get('categories').find({ id: req.params.id }).assign(updatedCategory).write();
  
  res.json(updatedCategory);
});

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
 */
router.delete('/:id', (req, res) => {
  const category = db.get('categories').find({ id: req.params.id }).value();
  
  if (!category) {
    return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
  }
  
  // Remove category
  db.get('categories').remove({ id: req.params.id }).write();
  
  // Update articles that belong to this category (set categoryId to null)
  db.get('articles').filter({ categoryId: req.params.id })
    .each(article => {
      article.categoryId = null;
    })
    .write();
  
  res.json({ message: 'دسته‌بندی با موفقیت حذف شد' });
});

module.exports = router; 