const router = require('express').Router();
const controller1 = require('../controller/user')
const controller2 = require('../controller/game')

router.post('/signup', controller1.postSignup);

router.post('/login', controller1.postLogin);

router.get('/user', controller1.getUser);

router.post('/logout', controller1.postLogout);

router.get('/history/:player1/:player2', controller2.getHistory);

router.post('/history/:player1/:player2', controller2.postHistory);

router.get('/:userId', controller2.getName);

module.exports = router;