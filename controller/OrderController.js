const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const order = async (req, res) => {
  try {
    const connection = await conn();
    const {
      items,
      delivery,
      totalQuantity,
      totalPrice,
      userId,
      firstBookTitle,
    } = req.body;

    // Step 1: 배송 정보 insert
    const deliverySql = `INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)`;
    const deliveryValues = [
      delivery.address,
      delivery.receiver,
      delivery.contact,
    ];
    const [deliveryResults] = await connection.query(
      deliverySql,
      deliveryValues
    );
    const delivery_id = deliveryResults.insertId;

    // Step 2: 주문 정보 insert
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
    const [orderResults] = await connection.query(orderSql, orderValues);
    const order_id = orderResults.insertId;

    // Step 3: 주문 상세 insert
    const orderedBookSql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;
    const orderedBookValues = items.map((item) => [
      order_id,
      item.book_id,
      item.quantity,
    ]);
    await connection.query(orderedBookSql, [orderedBookValues]);

    return res.status(StatusCodes.OK).json({
      success: true,
      orderId: order_id,
      deliveryId: delivery_id,
    });
  } catch (err) {
    console.log('Order flow error:', err);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: '주문 처리 실패' });
  }
};

// ✅ 추가 정의
const getOrders = (req, res) => {
  res.send('전체 주문 목록');
};

const getOrderDetail = (req, res) => {
  res.send('주문 상세');
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
