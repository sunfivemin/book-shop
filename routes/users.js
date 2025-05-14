const express = require('express');
const router = express.Router();
const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

router.use(express.json());

router.post('/join', (req, res) => {
  const { email, password } = req.body;

  let sql = 'INSERT INTO user (email, password) VALUES (?,?)';
  let values = [email, password];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    return res.status(StatusCodes.CREATED).json(results);
  });
});

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
