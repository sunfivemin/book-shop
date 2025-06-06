const express = require('express');
const router = express.Router();
const {
  join,
  login,
  passwordResetRequest,
  passwordReset,
} = require('../controller/UserController');

router.use(express.json());

router.post('/join', join); // 회원가입
router.post('/login', login); // 로그인
router.post('/reset', passwordResetRequest); // 초기화 요청
router.put('/reset', passwordReset); // 초기화 실행

module.exports = router;
