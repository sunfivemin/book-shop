const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// JWT 인증 공통 함수
function ensureAuthorization(req) {
  const token = req.headers['authorization'];
  if (!token) throw new Error('토큰 없음');
  return jwt.verify(token, process.env.PRIVATE_KEY);
}

// 장바구니에 도서 담기
const addToCart = async (req, res) => {
  const { book_id, quantity } = req.body;

  try {
    const user = ensureAuthorization(req);
    const connection = await conn();

    if (!book_id || !quantity) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: '필수 정보 누락' });
    }

    const sql = `
      INSERT INTO cartItems (book_id, quantity, user_id)
      VALUES (?, ?, ?)
    `;
    const values = [book_id, quantity, user.id];

    const [result] = await connection.execute(sql, values);
    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error('addToCart 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 선택한 장바구니 항목 목록 조회
const getCartItems = async (req, res) => {
  const { selected } = req.body;

  try {
    const user = ensureAuthorization(req);
    const connection = await conn();

    const sql = `
      SELECT cartItems.id, book_id, title, summary, quantity, price
      FROM cartItems
      LEFT JOIN books ON cartItems.book_id = books.id
      WHERE user_id = ? AND cartItems.id IN (?)
    `;
    const values = [user.id, selected];

    const [results] = await connection.execute(sql, values);
    return res.status(StatusCodes.OK).json(results);
  } catch (err) {
    console.error('getCartItems 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 장바구니 항목 제거
const removeCartItem = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await conn();
    const sql = `DELETE FROM cartItems WHERE id = ?`;
    const [result] = await connection.execute(sql, [id]);

    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    console.error('removeCartItem 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  addToCart,
  getCartItems,
  removeCartItem,
};
