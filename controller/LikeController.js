const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth'); // ✅ 모듈화된 함수 불러오기

// 좋아요 추가
const addLike = async (req, res) => {
  const { id: book_id } = req.params;
  const user = ensureAuthorization(req);

  if (user instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '세션이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }
  if (user instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
  if (user instanceof Error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: user.message,
    });
  }

  try {
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
  const user = ensureAuthorization(req);

  if (user instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '세션이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }
  if (user instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
  if (user instanceof Error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: user.message,
    });
  }

  try {
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
