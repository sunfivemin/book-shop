const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

// 카테고리별, 신간 여부 전체 도서 목록 조회
const allBooks = (req, res) => {
  let { category_id, news } = req.query;
  let sql = 'SELECT * FROM books';
  let values = [];

  // 1. 카테고리와 신간 모두 포함된 경우
  if (category_id && news) {
    sql +=
      ' WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    values = [category_id, news];

    // 2. 카테고리만 있는 경우
  } else if (category_id) {
    sql += ' WHERE category_id=?';
    values = [category_id];

    // 3. 신간만 있는 경우
  } else if (news) {
    sql +=
      ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    values = [news];
  }

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

// 도서 상세 조회 API
const bookDetail = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT * FROM books 
    LEFT JOIN category ON books.category_id = category.id 
    WHERE books.id = ?`;

  conn.query(sql, [id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
    else return res.status(StatusCodes.NOT_FOUND).end();
  });
};

module.exports = {
  allBooks,
  bookDetail,
};
