const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
            cb(null, 'public/product-images/')
      },
      filename: function (req, file, cb) {
            const nameOfImage = Math.round(Math.random() * 1E9) + '-' + Date.now() + path.extname(file.originalname)
            cb(null, nameOfImage)
      }
})
const upload = multer({ storage: storage })
const multipleUpload = upload.fields([{ name: 'product-images', maxCount: 4 }])

const adminAuth = (req,res,next) => {
      if(req.session.adminLoggedIn){
            next();
      }else{
            res.redirect('/admin')
      }
}



/*Admin Login. */

router.get('/', adminController.adminLogin)
router.post('/', adminController.checkAdminLogin)     

// GET Admin Home
router.get('/home',adminAuth, adminController.adminHome)

// Products
router.get('/viewProducts',adminAuth, adminController.viewProducts);
router.get('/addProduct',adminAuth, adminController.getAddProducts);
router.post('/addProduct',adminAuth, multipleUpload, adminController.postAddProducts);
router.get('/deleteProducts/:id',adminAuth, adminController.deleteProduct);
router.get('/editProducts/:id',adminAuth, adminController.viewEditProduct);
router.post('/editProducts/:id',adminAuth,multipleUpload,adminController.updateProductDetails);
router.get('/featuredProduct/:id',adminAuth, adminController.featuredProduct);


// User
router.get('/user',adminAuth, adminController.getUsersData)
router.get('/changeUserStatus/:id',adminAuth,adminController.changeStatus)




// Categories
router.get('/category',adminAuth, categoryController.getAllCategories);
router.post('/addCategory', adminAuth, categoryController.addCategory);
router.get('/categoryDelete/:id',adminAuth, categoryController.deleteCategory);


//Orders
router.get('/orders', adminAuth, (req, res) => {
      res.render('admin/viewOrders', { layout: 'admin-layout' })
})

router.get('/logout', ((req, res) => {
      req.session.adminLoggedIn = false;
      res.redirect('/admin')
}))

module.exports = router;
