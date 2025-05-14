const express = require('express');
const router = express.Router();
const conn = require('../mariadb');

const join = require('../controller/UserController');

router.use(express.json());

router.post('/join', join);

router.post('/login', (req, res) => {
  res.json('로그인');
});

router.post('/reset', (req, res) => {
  res.json('초기화');
});

router.post('/reset', (req, res) => {
  res.json('초기화 요청');
});

module.exports = router;
