const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

// 주문 API
const order = async (req, res) => {
  try {
    const connection = await conn();

    const {
      items, // ex: [{ book_id: 3, quantity: 1 }, { book_id: 4, quantity: 2 }]
      delivery,
      totalQuantity,
      totalPrice,
      userId,
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
      userId,
      delivery_id,
    ];
    const [orderResults] = await connection.execute(orderSql, orderValues);
    const order_id = orderResults.insertId;

    // 3. 주문 상세 INSERT (orderedBook)
    const orderedBookSql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;
    const orderedBookValues = items.map((item) => [
      order_id,
      item.book_id,
      item.quantity,
    ]);
    await connection.query(orderedBookSql, [orderedBookValues]);

    // 4. 장바구니 삭제
    await deleteCartItems(connection, userId, items);

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
  const bookIds = items.map((item) => item.book_id);
  if (bookIds.length === 0) return;

  // 해당 사용자의 장바구니 id 목록 조회
  const findCartSql = `SELECT id FROM cartItems WHERE user_id = ? AND book_id IN (?)`;
  const [rows] = await connection.query(findCartSql, [userId, bookIds]);
  const cartItemIds = rows.map((row) => row.id);
  if (cartItemIds.length === 0) return;

  const deleteSql = `DELETE FROM cartItems WHERE id IN (?)`;
  await connection.query(deleteSql, [cartItemIds]);
};

// 주문 목록
const getOrders = (req, res) => {
  res.send('전체 주문 목록');
};

// 주문 상세
const getOrderDetail = (req, res) => {
  res.send('주문 상세');
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
