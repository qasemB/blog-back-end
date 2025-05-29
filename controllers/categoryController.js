const { db, createId } = require('../db');

// دریافت تمام دسته‌بندی‌ها
const getAllCategories = (req, res) => {
  try {
    const categories = db.get('categories').value();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت دسته‌بندی‌ها', error: error.message });
  }
};

// دریافت یک دسته‌بندی با شناسه
const getCategoryById = (req, res) => {
  try {
    const category = db.get('categories').find({ id: req.params.id }).value();
    
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت دسته‌بندی', error: error.message });
  }
};

// دریافت مقالات مرتبط با یک دسته‌بندی
const getCategoryArticles = (req, res) => {
  try {
    const category = db.get('categories').find({ id: req.params.id }).value();
    
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    
    const articles = db.get('articles').filter({ categoryId: req.params.id }).value();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت مقالات دسته‌بندی', error: error.message });
  }
};

// ایجاد دسته‌بندی جدید
const createCategory = (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'عنوان دسته‌بندی الزامی است' });
    }
    
    // بررسی تکراری نبودن عنوان
    const existingCategory = db.get('categories').find({ title }).value();
    if (existingCategory) {
      return res.status(400).json({ message: 'دسته‌بندی با این عنوان قبلاً وجود دارد' });
    }
    
    const newCategory = {
      id: createId(),
      title,
      description: description || ''
    };
    
    db.get('categories').push(newCategory).write();
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ایجاد دسته‌بندی', error: error.message });
  }
};

// بروزرسانی دسته‌بندی
const updateCategory = (req, res) => {
  try {
    const { title, description } = req.body;
    
    const category = db.get('categories').find({ id: req.params.id }).value();
    
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    
    // بررسی تکراری نبودن عنوان (در صورت تغییر)
    if (title && title !== category.title) {
      const existingCategory = db.get('categories').find({ title }).value();
      if (existingCategory) {
        return res.status(400).json({ message: 'دسته‌بندی با این عنوان قبلاً وجود دارد' });
      }
    }
    
    const updatedCategory = {
      ...category,
      title: title !== undefined ? title : category.title,
      description: description !== undefined ? description : category.description
    };
    
    db.get('categories').find({ id: req.params.id }).assign(updatedCategory).write();
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی دسته‌بندی', error: error.message });
  }
};

// حذف دسته‌بندی
const deleteCategory = (req, res) => {
  try {
    const category = db.get('categories').find({ id: req.params.id }).value();
    
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    
    // بررسی اینکه آیا مقاله‌ای با این دسته‌بندی وجود دارد
    const articlesInCategory = db.get('articles').filter({ categoryId: req.params.id }).value();
    if (articlesInCategory.length > 0) {
      return res.status(400).json({ 
        message: 'امکان حذف این دسته‌بندی وجود ندارد زیرا مقالاتی به آن وابسته هستند',
        articlesCount: articlesInCategory.length
      });
    }
    
    db.get('categories').remove({ id: req.params.id }).write();
    
    res.json({ message: 'دسته‌بندی با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف دسته‌بندی', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryArticles,
  createCategory,
  updateCategory,
  deleteCategory
}; 