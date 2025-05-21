const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG (transparent)
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Save the image to the public directory
fs.writeFileSync(
  path.join(__dirname, '1.png'), 
  Buffer.from(base64Image, 'base64')
);

console.log('Image file created successfully at public/1.png'); 