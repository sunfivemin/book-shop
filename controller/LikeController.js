const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// 공통 JWT 인증 함수
function ensureAuthorization(req) {
  const receivedJwt = req.headers['authorization'];
  if (!receivedJwt) throw new Error('JWT가 없습니다.');
  const decoded = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
  console.log('decoded jwt:', decoded);
  return decoded;
}

// 좋아요 추가
const addLike = async (req, res) => {
  const { id: book_id } = req.params;

  try {
    const user = ensureAuthorization(req);
    const connection = await conn();

    const sql = 'INSERT INTO likes (user_id, liked_book_id) VALUES (?, ?)';
    const values = [user.id, book_id];

    const [result] = await connection.execute(sql, values);
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.error('addLike 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 좋아요 삭제
const removeLike = async (req, res) => {
  const { id: book_id } = req.params;

  try {
    const user = ensureAuthorization(req);
    const connection = await conn();

    const sql = 'DELETE FROM likes WHERE user_id = ? AND liked_book_id = ?';
    const values = [user.id, book_id];

    const [result] = await connection.execute(sql, values);
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.error('removeLike 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  addLike,
  removeLike,
};
