const router = require('express').Router();
const controller = require('../controller/user')

router.post('/signup', controller.postSignup);

router.post('/login', controller.postLogin);

router.get('/user', controller.getUser);

router.post('/logout' , controller.postLogout);

module.exports = router;