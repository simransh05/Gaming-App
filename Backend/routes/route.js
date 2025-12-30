const router = require('express').Router();
const controller1 = require('../controller/user')
const controller2 = require('../controller/game')

router.post('/signup', controller1.postSignup);

router.post('/login', controller1.postLogin);

router.get('/user', controller1.getUser);

router.post('/logout', controller1.postLogout);

router.get('/history/:player1/:player2/:userId', controller2.getHistory);

router.get('/:userId', controller2.getName);

router.post('/history/delete', controller2.deleteHistory)

module.exports = router;