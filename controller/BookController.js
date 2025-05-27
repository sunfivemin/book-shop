const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const ensureAuthorization = require('../auth');

// 전체 도서 목록 조회 (pagination 포함)
const allBooks = async (req, res) => {
  try {
    const { category_id, news, limit, currentPage } = req.query;
    const offset = limit * (currentPage - 1);
    const connection = await conn();

    let sql =
      'SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM likes WHERE liked_book_id=books.id) AS likes FROM books';
    let values = [];

    if (category_id && news) {
      sql +=
        ' WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
      values = [category_id];
    } else if (category_id) {
      sql += ' WHERE category_id=?';
      values = [category_id];
    } else if (news) {
      sql +=
        ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    }

    sql += ' LIMIT ? OFFSET ?';
    values.push(parseInt(limit), offset);

    const [results] = await connection.query(sql, values);
    const [[countResult]] = await connection.query(
      'SELECT FOUND_ROWS() as totalCount'
    );

    return res.status(StatusCodes.OK).json({
      books: results,
      pagination: {
        currentPage: parseInt(currentPage),
        totalCount: countResult.totalCount,
      },
    });
  } catch (err) {
    console.error('allBooks 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

// 도서 상세 조회 (Liked 포함 여부)
const bookDetail = async (req, res) => {
  const book_id = req.params.id;
  let userId = null;
  let connection;

  try {
    connection = await conn();
    const authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: '세션이 만료되었습니다. 다시 로그인 해주세요.',
      });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: '유효하지 않은 토큰입니다.',
      });
    } else if (!(authorization instanceof Error)) {
      userId = authorization.id; // 로그인 상태면 userId 설정
    }

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

    const values = [userId, book_id, book_id];
    const [results] = await connection.query(sql, values);

    if (results[0]) return res.status(StatusCodes.OK).json(results[0]);
    return res.status(StatusCodes.NOT_FOUND).end();
  } catch (err) {
    console.error('bookDetail 에러:', err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  allBooks,
  bookDetail,
};
