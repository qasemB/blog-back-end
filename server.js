const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

// Import routes
const categoryRoutes = require('./routes/categories');
const articleRoutes = require('./routes/articles');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'وبلاگ فارسی API',
      version: '1.0.0',
      description: 'API برای وبلاگ فارسی با استفاده از فایل‌های JSON',
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`,
        description: 'API Server',
      },
    ],
    components: {
      schemas: {
        Article: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            image: { type: 'string' },
            categoryId: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      requestBodies: {
        ArticleWithImage: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'عنوان مقاله'
                  },
                  content: {
                    type: 'string',
                    description: 'محتوای مقاله'
                  },
                  categoryId: {
                    type: 'string',
                    description: 'شناسه دسته‌بندی'
                  },
                  author: {
                    type: 'string',
                    description: 'نویسنده مقاله'
                  },
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'تصویر مقاله'
                  }
                },
                required: ['title', 'content']
              }
            }
          }
        },
        ImageUpload: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'فایل تصویر برای آپلود'
                  }
                },
                required: ['image']
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);

// Root route
app.get('/', (req, res) => {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`;
  res.json({
    message: 'به API وبلاگ فارسی خوش آمدید',
    documentation: `${baseUrl}/api-docs`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`سرور در پورت ${PORT} در حال اجرا است`);
  console.log(`مستندات API: http://localhost:${PORT}/api-docs`);
}); 
