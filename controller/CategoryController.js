const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

const allCategory = async (req, res) => {
  try {
    const connection = await conn(); // ✅ 연결 객체 받아오기
    const [rows] = await connection.query('SELECT * FROM category'); // ✅ query 호출
    return res.status(StatusCodes.OK).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  allCategory,
};
