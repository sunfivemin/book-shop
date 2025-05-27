const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const ensureAuthorization = require('../auth');
const jwt = require('jsonwebtoken');

// 주문 API
const order = async (req, res) => {
  const user = ensureAuthorization(req);

  // 인증 에러 처리
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

  const connection = await conn();

  try {
    const {
      items, // ex: [{ book_id: 3, quantity: 1 }, { book_id: 4, quantity: 2 }]
      delivery,
      totalQuantity,
      totalPrice,
      firstBookTitle,
    } = req.body;

    // 1. 배송 정보 INSERT
    const deliverySql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    const deliveryValues = [
      delivery.address,
      delivery.receiver,
      delivery.contact,
    ];
    const [deliveryResults] = await connection.execute(
      deliverySql,
      deliveryValues
    );
    const delivery_id = deliveryResults.insertId;

    // 2. 주문 정보 INSERT
    const orderSql = `
      INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
      VALUES (?, ?, ?, ?, ?)`;
    const orderValues = [
      firstBookTitle,
      totalQuantity,
      totalPrice,
      user.id,
      delivery_id,
    ];
    const [orderResults] = await connection.execute(orderSql, orderValues);
    const order_id = orderResults.insertId;

    // 3. 주문 상세 INSERT (orderedBook)
    const orderedBookSql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;
    const orderedBookValues = items.map(item => [
      order_id,
      item.book_id,
      item.quantity,
    ]);
    await connection.query(orderedBookSql, [orderedBookValues]);

    // 4. 장바구니 삭제
    await deleteCartItems(connection, user.id, items);

    return res.status(StatusCodes.OK).json({
      success: true,
      orderId: order_id,
      deliveryId: delivery_id,
    });
  } catch (err) {
    console.error('Order flow error:', err);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: '주문 처리 실패',
    });
  }
};

// 장바구니 삭제 함수
const deleteCartItems = async (connection, userId, items) => {
  const bookIds = items.map(item => item.book_id);
  if (bookIds.length === 0) return;

  const findCartSql = `SELECT id FROM cartItems WHERE user_id = ? AND book_id IN (?)`;
  const [rows] = await connection.query(findCartSql, [userId, bookIds]);
  const cartItemIds = rows.map(row => row.id);
  if (cartItemIds.length === 0) return;

  const deleteSql = `DELETE FROM cartItems WHERE id IN (?)`;
  await connection.query(deleteSql, [cartItemIds]);
};

// 주문 목록
const getOrders = async (req, res) => {
  const connection = await conn();

  const sql = `
    SELECT 
      orders.id,
      created_at,
      address,
      receiver,
      contact,
      book_title,
      total_quantity,
      total_price
    FROM orders
    LEFT JOIN delivery
    ON orders.delivery_id = delivery.id;
  `;
  const [rows] = await connection.query(sql);
  return res.status(StatusCodes.OK).json(rows);
};

// 주문 상세
const getOrderDetail = async (req, res) => {
  const { id } = req.params;
  const connection = await conn();

  const sql = `
  SELECT 
    orderedBook.book_id,
    books.title,
    books.author,
    books.price,
    orderedBook.quantity
  FROM orderedBook
  LEFT JOIN books ON orderedBook.book_id = books.id
  WHERE orderedBook.order_id = ?
`;

  try {
    const [rows] = await connection.query(sql, [id]);
    return res.status(StatusCodes.OK).json(rows);
  } catch (err) {
    console.error('상세 주문 조회 실패:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: '상세 주문 조회 실패',
    });
  }
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
