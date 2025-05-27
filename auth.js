// auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// 공통 JWT 인증 함수 (예외 발생 시 에러 객체 반환)
function ensureAuthorization(req) {
  try {
    const token = req.headers['authorization'];
    if (!token) throw new Error('JWT가 없습니다.');
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    console.log('✅ decoded user.id:', decoded.id);
    return decoded;
  } catch (err) {
    return err; // JWT 에러 객체 그대로 반환
  }
}

module.exports = ensureAuthorization;
