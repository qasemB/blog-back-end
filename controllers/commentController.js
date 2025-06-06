const { db, createId } = require('../db');

// دریافت تمام نظرات
const getAllComments = (req, res) => {
  try {
    const comments = db.get('comments').value();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت نظرات', error: error.message });
  }
};

// دریافت یک نظر با شناسه
const getCommentById = (req, res) => {
  try {
    const comment = db.get('comments').find({ id: req.params.id }).value();
    
    if (!comment) {
      return res.status(404).json({ message: 'نظر یافت نشد' });
    }
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت نظر', error: error.message });
  }
};

// ایجاد نظر جدید (فقط کاربران لاگین شده)
const createComment = (req, res) => {
  try {
    const { content, articleId } = req.body;
    
    if (!content || !articleId) {
      return res.status(400).json({ message: 'محتوای نظر و شناسه مقاله الزامی است' });
    }
    
    // بررسی وجود مقاله
    const article = db.get('articles').find({ id: articleId }).value();
    if (!article) {
      return res.status(400).json({ message: 'مقاله مورد نظر یافت نشد' });
    }
    
    const newComment = {
      id: createId(),
      content,
      articleId,
      author: req.user.username, // استفاده از نام کاربری از token
      userId: req.user.id, // اضافه کردن شناسه کاربر
      createdAt: new Date().toISOString()
    };
    
    db.get('comments').push(newComment).write();
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ایجاد نظر', error: error.message });
  }
};

// بروزرسانی نظر (فقط صاحب نظر یا ادمین)
const updateComment = (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = db.get('comments').find({ id: req.params.id }).value();
    
    if (!comment) {
      return res.status(404).json({ message: 'نظر یافت نشد' });
    }
    
    // بررسی اینکه آیا کاربر صاحب نظر است یا ادمین
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'فقط صاحب نظر یا ادمین می‌تواند نظر را ویرایش کند' });
    }
    
    const updatedComment = {
      ...comment,
      content: content !== undefined ? content : comment.content
    };
    
    db.get('comments').find({ id: req.params.id }).assign(updatedComment).write();
    
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی نظر', error: error.message });
  }
};

// حذف نظر (فقط صاحب نظر یا ادمین)
const deleteComment = (req, res) => {
  try {
    const comment = db.get('comments').find({ id: req.params.id }).value();
    
    if (!comment) {
      return res.status(404).json({ message: 'نظر یافت نشد' });
    }
    
    // بررسی اینکه آیا کاربر صاحب نظر است یا ادمین
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'فقط صاحب نظر یا ادمین می‌تواند نظر را حذف کند' });
    }
    
    db.get('comments').remove({ id: req.params.id }).write();
    
    res.json({ message: 'نظر با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف نظر', error: error.message });
  }
};

// دریافت نظرات بر اساس مقاله
const getCommentsByArticle = (req, res) => {
  try {
    const { articleId } = req.params;
    
    // بررسی وجود مقاله
    const article = db.get('articles').find({ id: articleId }).value();
    if (!article) {
      return res.status(404).json({ message: 'مقاله یافت نشد' });
    }
    
    const comments = db.get('comments').filter({ articleId }).value();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت نظرات مقاله', error: error.message });
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByArticle
}; 