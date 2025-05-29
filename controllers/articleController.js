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

// دریافت تمام مقالات با قابلیت فیلتر
const getAllArticles = (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let articlesQuery = db.get('articles');
    
    if (categoryId) {
      articlesQuery = articlesQuery.filter({ categoryId });
    }
    
    const articles = articlesQuery.value();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت مقالات', error: error.message });
  }
};

// دریافت یک مقاله با شناسه
const getArticleById = (req, res) => {
  try {
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت مقاله', error: error.message });
  }
};

// دریافت نظرات یک مقاله
const getArticleComments = (req, res) => {
  try {
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    const comments = db.get('comments').filter({ articleId: req.params.id }).value();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت نظرات مقاله', error: error.message });
  }
};

// ایجاد مقاله جدید
const createArticle = (req, res) => {
  try {
    const { title, content, categoryId, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'عنوان و محتوای مقاله الزامی است' });
    }
    
    // بررسی وجود دسته‌بندی
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
      image: req.body.image || null,
      categoryId: categoryId || null,
      author: author || 'نامشخص',
      createdAt: new Date().toISOString()
    };
    
    db.get('articles').push(newArticle).write();
    
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ایجاد مقاله', error: error.message });
  }
};

// ایجاد مقاله با آپلود تصویر
const createArticleWithImage = (req, res) => {
  try {
    const { title, content, categoryId, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'عنوان و محتوای مقاله الزامی است' });
    }
    
    // بررسی وجود دسته‌بندی
    if (categoryId) {
      const category = db.get('categories').find({ id: categoryId }).value();
      if (!category) {
        return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
      }
    }
    
    const imagePath = req.file ? `/public/${req.file.filename}` : null;
    
    const newArticle = {
      id: createId(),
      title,
      content,
      image: imagePath,
      categoryId: categoryId || null,
      author: author || 'نامشخص',
      createdAt: new Date().toISOString()
    };
    
    db.get('articles').push(newArticle).write();
    
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ایجاد مقاله', error: error.message });
  }
};

// بروزرسانی مقاله
const updateArticle = (req, res) => {
  try {
    const { title, content, image, categoryId, author } = req.body;
    
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    // بررسی وجود دسته‌بندی در صورت تغییر
    if (categoryId && categoryId !== article.categoryId) {
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
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی مقاله', error: error.message });
  }
};

// بروزرسانی مقاله همراه با تصویر
const updateArticleWithImage = (req, res) => {
  try {
    const { title, content, categoryId, author } = req.body;
    
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    // بررسی وجود دسته‌بندی در صورت تغییر
    if (categoryId && categoryId !== article.categoryId) {
      const category = db.get('categories').find({ id: categoryId }).value();
      if (!category) {
        return res.status(400).json({ message: 'دسته‌بندی مورد نظر یافت نشد' });
      }
    }
    
    // استفاده از تصویر جدید در صورت آپلود، وگرنه نگه داشتن تصویر قبلی
    const imagePath = req.file ? `/public/${req.file.filename}` : article.image;
    
    const updatedArticle = {
      ...article,
      title: title !== undefined ? title : article.title,
      content: content !== undefined ? content : article.content,
      image: imagePath,
      categoryId: categoryId !== undefined ? categoryId : article.categoryId,
      author: author !== undefined ? author : article.author
    };
    
    db.get('articles').find({ id: req.params.id }).assign(updatedArticle).write();
    
    res.json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی مقاله', error: error.message });
  }
};

// حذف مقاله
const deleteArticle = (req, res) => {
  try {
    const article = db.get('articles').find({ id: req.params.id }).value();
    
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    // حذف نظرات مرتبط با مقاله
    db.get('comments').remove({ articleId: req.params.id }).write();
    
    // حذف مقاله
    db.get('articles').remove({ id: req.params.id }).write();
    
    res.json({ message: 'مقاله و نظرات مرتبط با آن با موفقیت حذف شدند' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف مقاله', error: error.message });
  }
};

// آپلود تصویر جداگانه
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'فایل تصویر انتخاب نشده است' });
    }
    
    const imagePath = `/public/${req.file.filename}`;
    
    res.json({
      message: 'تصویر با موفقیت آپلود شد',
      imagePath: imagePath
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در آپلود تصویر', error: error.message });
  }
};

module.exports = {
  upload,
  getAllArticles,
  getArticleById,
  getArticleComments,
  createArticle,
  createArticleWithImage,
  updateArticle,
  updateArticleWithImage,
  deleteArticle,
  uploadImage
}; 