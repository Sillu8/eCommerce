const productHelper = require('../helpers/productHelper');
const userHelper = require('../helpers/userHelper');
const categoryHelper = require('../helpers/categoryHelper');
const productModel = require('../models/productModel');

module.exports = {

    // Get User Home
    userHome: async (req, res) => {
        const featuredProducts = await productHelper.getFeaturedProducts()
        if (req.session.user) {
            const count = await productHelper.getCartProductsCount(req.session.user._id)
            req.session.user.cartItemsCount = count;
            const wishlistCount = await productHelper.getWishlistProductsCount(req.session.user._id);
            req.session.user.wishlistCount = wishlistCount;
        }
        res.render('user/userHome', { featuredProducts, user: req.session.user });
    },


    // Get Signup Page
    getSignup: (req, res) => {
        // console.log(req.session);
        res.render('user/userSignup', { signupErr: req.session.signupErr, errMessage: req.session.errMessage })
        req.session.signupErr = false;
    },

    // Post Signup Page
    userSignup: async (req, res) => {
        try {
            const result = await userHelper.doSignup(req.body);
            if (result.userExists) {
                req.session.signupErr = true;
                req.session.errMessage = result.errMessage;
                res.redirect('/signup');
            } else {
                res.redirect('/login')
            }
        } catch (err) {
            console.log(err)
            res.redirect('/signup')
        }
    },


    // Get Login Page
    login: (req, res) => {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        } else {
            res.render('user/userLogin', { loginErr: req.session.userLoggedIn, errMessage: req.session.loginErrMessage });
            req.session.userLoggedIn = false;
        }

    },
    //Post Login
    userLogin: (req, res) => {
        userHelper.doLogin(req.body).then((result) => {                    //can do it without promise too?
            if (result.status) {
                req.session.user = result.userDetails
                req.session.userLoggedIn = true;
                res.redirect('/');
            } else {
                req.session.loginErr = true;
                req.session.loginErrMessage = result.message;
                res.redirect('/login')
            }
        }).catch((err) => {
            console.log(err);
            res.redirect('/login')
        })
    },

    logout: (req, res) => {
        req.session.user = null;
        req.session.userLoggedIn = false;
        res.redirect('/')
    },

    userDetails: (req, res) => {
        res.render('user/accDetails', { layout: 'user-layout', user: req.session.user })
    },

    getProducts: async (req, res) => {
        try {
            const products = await productHelper.getAllProducts();
            const categories = await categoryHelper.getAllCategories();
            // console.log(products);
            // console.log(products[0].img);
            res.render('user/shop', { products, categories, user: req.session.user });
        } catch (err) {
            console.log(err);
            res.redirect('/');
        }
    },

    productsByCategory: async (req, res) => {
        try {
            const products = await productModel.find({ category: req.params.id }).lean().populate('category')
            const categories = await categoryHelper.getAllCategories();
            // console.log(products);
            res.render('user/productsByCat', { products, categories, user: req.session.user })
        } catch (error) {
            console.log(error);
            res.redirect('/')
        }
    },

    productDetails: async (req, res) => {
        try {
            const product = await productModel.find({ _id: req.params.id }).lean()
            // console.log(product);
            res.render('user/productDetails', { product, user: req.session.user })
        } catch (error) {
            console.log(error)
            res.redirect('/');
        }
    },

    addProductToCart: async (req, res) => {
        try {
            if (req.session.userLoggedIn) {
                await productHelper.addProductToCart(req.body.productID, req.session.user._id)
                res.json({ status: true })
            }else{
                res.json({status:false,url:'/login'})
            }
        } catch (err) {
            console.log(err);
            res.redirect('/')
        }
    },

    viewCart: async (req, res) => {
        try {
            const cartData = await productHelper.getCartItems(req.params.id); //req.params.id and user._id are both same here
            const totalPrice = await productHelper.getTotalPrice(req.session.user._id);
            // console.log(cartData);
            res.render('user/cart', { cartData, user: req.session.user, price: totalPrice })
        } catch (error) {
            console.log(error);
            res.redirect('/home')
        }
    },

    changeProductQuantity: async (req, res) => {
        try {
            // console.log(req.body);
            const result = await productHelper.changeProductQuantity(req.body);
            const totalPrice = await productHelper.getTotalPrice(req.session.user._id);
            res.json({ result, price: totalPrice })
        } catch (error) {
            console.log(error)
            res.redirect('/home')
        }
    },

    removeProduct: async (req, res) => {
        try {
            const result = await productHelper.removeProduct(req.body);
            res.json(result)
        } catch (error) {
            console.log(error);
            res.redirect('/home');
        }
    },

    addToWishlist: async (req, res) => {
        try {
            const product = await productHelper.addToWishlist(req.params.id, req.session.user._id);
            res.redirect('/products')
        } catch (error) {
            console.log(error);
            res.redirect('/')
        }
    },

    getWishlist: async (req, res) => {
        try {
            const wishlistItems = await productHelper.getWishlistItems(req.session.user._id)
            res.render('user/wishlist', { wishlistItems, user: req.session.user });
        } catch (error) {
            console.log(error);
            res.redirect('/')
        }
    },

    removeWishlistProduct: async (req, res) => {
        try {
            const result = await productHelper.removeWishlistProduct(req.body)
            res.json(result)
        } catch (error) {

        }
    },

    checkout: (req, res) => {
        try {
            res.render('user/checkout');
        } catch (error) {
            console.log(error)
        }
    },

}