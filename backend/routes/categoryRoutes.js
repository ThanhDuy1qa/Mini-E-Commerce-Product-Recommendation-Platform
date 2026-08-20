const express = require('express');

const router = express.Router();


const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory

} = require('../controller/categoryController');


const {
  verifyAdmin
} = require('../middleware/authMiddleware');



router.get('/', getCategories);


router.post(
  '/',
  verifyAdmin,
  createCategory
);


router.put(
  '/:id',
  verifyAdmin,
  updateCategory
);


router.delete(
  '/:id',
  verifyAdmin,
  deleteCategory
);


module.exports = router;