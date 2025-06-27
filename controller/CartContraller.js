const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

// 공통 인증 에러 핸들러 함수
function handleAuthError(auth, res) {
  if (auth instanceof jwt.TokenExpiredError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '로그인 세션이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }
  if (auth instanceof jwt.JsonWebTokenError) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
  if (auth instanceof Error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: auth.message,
    });
  }
}

// 장바구니 담기
const addToCart = async (req, res) => {
  const { book_id, quantity } = req.body;
  const auth = ensureAuthorization(req);
  const error = handleAuthError(auth, res);
  if (error) return error;

  if (!book_id || !quantity) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: '필수 정보 누락' });
  }

  try {
    const connection = await conn();
    const sql = `INSERT INTO cartItems (book_id, quantity, user_id) VALUES (?, ?, ?)`;
    const values = [book_id, quantity, auth.id];
    const [result] = await connection.execute(sql, values);
    return res
      .status(StatusCodes.CREATED)
      .json({ insertedId: result.insertId });
  } catch (err) {
    console.error('addToCart 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 장바구니 선택 항목 조회
const getCartItems = async (req, res) => {
  const { selected } = req.body;
  const auth = ensureAuthorization(req);
  const error = handleAuthError(auth, res);
  if (error) return error;

  if (!Array.isArray(selected) || selected.length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: '선택된 항목이 없습니다.' });
  }

  try {
    const connection = await conn();
    const placeholders = selected.map(() => '?').join(',');
    const sql = `
      SELECT cartItems.id, book_id, title, summary, quantity, price
      FROM cartItems
      LEFT JOIN books ON cartItems.book_id = books.id
      WHERE user_id = ? AND cartItems.id IN (${placeholders})
    `;
    const values = [auth.id, ...selected];
    const [results] = await connection.execute(sql, values);
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error('getCartItems 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 장바구니 항목 삭제
const removeCartItem = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await conn();
    const sql = 'DELETE FROM cartItems WHERE id = ?';
    const [result] = await connection.execute(sql, [id]);
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.error('removeCartItem 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 장바구니 전체 조회
const getAllCartItems = async (req, res) => {
  const auth = ensureAuthorization(req);
  const error = handleAuthError(auth, res);
  if (error) return error;

  try {
    const connection = await conn();
    const sql = `
      SELECT cartItems.id, book_id, title, summary, quantity, price
      FROM cartItems
      LEFT JOIN books ON cartItems.book_id = books.id
      WHERE user_id = ?
    `;
    const [results] = await connection.execute(sql, [auth.id]);
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error('getAllCartItems 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
  getAllCartItems,
};
