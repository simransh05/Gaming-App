const router = require('express').Router();
const controller1 = require('../controller/user')
const controller2 = require('../controller/game')
const controller3 = require('../controller/friends')

router.post('/signup', controller1.postSignup);

router.post('/login', controller1.postLogin);

router.get('/user', controller1.getUser);

router.post('/logout', controller1.postLogout);

router.get('/history/:player1/:player2/:userId', controller2.getHistory);

router.post('/history/delete', controller2.deleteHistory);

router.get('/friend/:userId',controller3.getFriends);

router.get('/friend/:userId/:id',controller3.getIndividualFriend);

router.post('/friend/:userId/:id',controller3.postFriend);

router.get('/rank', controller3.getRanking);

router.get('/:userId', controller2.getName);

module.exports = router;