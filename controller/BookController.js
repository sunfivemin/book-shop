const { response } = require('express');
const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');

// 카테고리별, 신간 여부 전체 도서 목록 조회
const allBooks = (req, res) => {
  let { category_id, news, limit, currentPage } = req.query;
  // limit : page 당 도서수               ex. 3
  // currentPage : 현재 및 페이지          ex. 1, 2, 3 ...
  // offset : limit * (currentPage-1)   ex. 0, 3, 6 ...

  let offset = limit * (currentPage - 1);
  let sql =
    'SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books';
  let values = [parseInt(limit), offset];

  // 1. 카테고리와 신간 모두 포함된 경우
  if (category_id && news) {
    sql +=
      ' WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    values = [category_id];

    // 2. 카테고리만 있는 경우
  } else if (category_id) {
    sql += ' WHERE category_id=?';
    values = [category_id];

    // 3. 신간만 있는 경우
  } else if (news) {
    sql +=
      ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
  }

  sql += ' LIMIT ? OFFSET ? ';
  values.push(parseInt(limit), offset);

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
  const { user_id } = req.query;
  const book_id = req.params.id;

  const sql = `
    SELECT *,
      (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes,
      (SELECT EXISTS (
        SELECT * FROM likes 
        WHERE user_id = ? AND liked_book_id = ?
      )) AS liked
    FROM books
    LEFT JOIN category ON books.category_id = category.category_id
    WHERE books.id = ?;
  `;

  const values = [user_id, book_id, book_id];

  conn.query(sql, values, (err, results) => {
    if (err) return res.status(400).end();
    if (results[0]) return res.status(200).json(results[0]);
    return res.status(404).end();
  });
};

module.exports = {
  allBooks,
  bookDetail,
};
