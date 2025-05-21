const express = require('express');
const router = express.Router();
const { db, createId } = require('../db');
const multer = require('multer');
const path = require('path');

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'));
  },
  filename: function (req, file, cb) {
    // Use a unique name for the file to avoid overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری مجاز هستند!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
router.get('/', (req, res) => {
  const articles = db.get('articles').value();
  res.json(articles);
});

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
router.get('/:id', (req, res) => {
  const article = db.get('articles').find({ id: req.params.id }).value();
  
  if (!article) {
    return res.status(404).json({ message: 'مقاله یافت نشد' });
  }
  
  res.json(article);
});

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
router.get('/:id/comments', (req, res) => {
  const article = db.get('articles').find({ id: req.params.id }).value();
  
  if (!article) {
    return res.status(404).json({ message: 'مقاله یافت نشد' });
  }
  
  const comments = db.get('comments').filter({ articleId: req.params.id }).value();
  res.json(comments);
});

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: ایجاد مقاله جدید
 *     tags: [Articles]
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
 */
router.post('/', (req, res) => {
  const { title, content, categoryId, author, image } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: 'عنوان و محتوای مقاله الزامی است' });
  }
  
  // Check if category exists if categoryId is provided
  if (categoryId) {
    const category = db.get('categories').find({ id: categoryId }).value();
    if (!category) {
      return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
    }
  }
  
  const newArticle = {
    id: createId(),
    title,
    content,
    image: image || null,
    categoryId: categoryId || null,
    author: author || 'ناشناس',
    createdAt: new Date().toISOString()
  };
  
  db.get('articles').push(newArticle).write();
  
  res.status(201).json(newArticle);
});

/**
 * @swagger
 * /api/articles/upload:
 *   post:
 *     summary: آپلود تصویر برای مقاله
 *     tags: [Articles]
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
 */
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لطفاً یک فایل تصویر انتخاب کنید' });
    }
    
    // Create the image URL
    const imageUrl = `/public/${req.file.filename}`;
    
    res.json({ 
      message: 'تصویر با موفقیت آپلود شد',
      imageUrl: imageUrl 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'خطا در آپلود تصویر',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/with-image:
 *   post:
 *     summary: ایجاد مقاله جدید همراه با تصویر
 *     tags: [Articles]
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
 */
router.post('/with-image', upload.single('image'), (req, res) => {
  try {
    const { title, content, categoryId, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'عنوان و محتوای مقاله الزامی است' });
    }
    
    // Check if category exists if categoryId is provided
    if (categoryId) {
      const category = db.get('categories').find({ id: categoryId }).value();
      if (!category) {
        return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
      }
    }
    
    // Create image URL if file was uploaded
    const imageUrl = req.file ? `/public/${req.file.filename}` : null;
    
    const newArticle = {
      id: createId(),
      title,
      content,
      image: imageUrl,
      categoryId: categoryId || null,
      author: author || 'ناشناس',
      createdAt: new Date().toISOString()
    };
    
    db.get('articles').push(newArticle).write();
    
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ 
      message: 'خطا در ایجاد مقاله',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     summary: بروزرسانی مقاله
 *     tags: [Articles]
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
 *       404:
 *         description: مقاله یافت نشد
 */
router.put('/:id', (req, res) => {
  const { title, content, categoryId, author, image } = req.body;
  
  const article = db.get('articles').find({ id: req.params.id }).value();
  
  if (!article) {
    return res.status(404).json({ message: 'مقاله یافت نشد' });
  }
  
  // Check if category exists if categoryId is provided
  if (categoryId) {
    const category = db.get('categories').find({ id: categoryId }).value();
    if (!category) {
      return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
    }
  }
  
  const updatedArticle = {
    ...article,
    title: title !== undefined ? title : article.title,
    content: content !== undefined ? content : article.content,
    image: image !== undefined ? image : article.image,
    categoryId: categoryId !== undefined ? categoryId : article.categoryId,
    author: author !== undefined ? author : article.author
  };
  
  db.get('articles').find({ id: req.params.id }).assign(updatedArticle).write();
  
  res.json(updatedArticle);
});

/**
 * @swagger
 * /api/articles/{id}/with-image:
 *   put:
 *     summary: بروزرسانی مقاله همراه با تصویر
 *     tags: [Articles]
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
 */
router.put('/:id/with-image', upload.single('image'), (req, res) => {
  try {
    const { title, content, categoryId, author } = req.body;
    
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    // Check if category exists if categoryId is provided
    if (categoryId) {
      const category = db.get('categories').find({ id: categoryId }).value();
      if (!category) {
        return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
      }
    }
    
    // Create image URL if file was uploaded
    const imageUrl = req.file ? `/public/${req.file.filename}` : article.image;
    
    const updatedArticle = {
      ...article,
      title: title !== undefined ? title : article.title,
      content: content !== undefined ? content : article.content,
      image: imageUrl,
      categoryId: categoryId !== undefined ? categoryId : article.categoryId,
      author: author !== undefined ? author : article.author
    };
    
    db.get('articles').find({ id: req.params.id }).assign(updatedArticle).write();
    
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ 
      message: 'خطا در بروزرسانی مقاله',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: حذف مقاله
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
 *         description: مقاله با موفقیت حذف شد
 *       404:
 *         description: مقاله یافت نشد
 */
router.delete('/:id', (req, res) => {
  const article = db.get('articles').find({ id: req.params.id }).value();
  
  if (!article) {
    return res.status(404).json({ message: 'مقاله یافت نشد' });
  }
  
  // Remove article
  db.get('articles').remove({ id: req.params.id }).write();
  
  // Remove all comments associated with this article
  db.get('comments').remove({ articleId: req.params.id }).write();
  
  res.json({ message: 'مقاله با موفقیت حذف شد' });
});

module.exports = router; 