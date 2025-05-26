const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const join = async (req, res) => {
  const { email, password } = req.body;
  const connection = await conn(); // ✅ 커넥션 받아오기

  const salt = crypto.randomBytes(64).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('base64');

  const sql = 'INSERT INTO users (email, password, salt) VALUES (?, ?, ?)';
  const values = [email, hashPassword, salt];

  try {
    const [result] = await connection.execute(sql, values); // ✅ execute로 변경
    return res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const connection = await conn(); // ✅ 커넥션 객체 받아오기

  const sql = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await connection.query(sql, [email]); // ✅ await query

    const loginUser = results[0];

    if (!loginUser) return res.status(StatusCodes.UNAUTHORIZED).end();

    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 64, 'sha512')
      .toString('base64');

    if (loginUser.password !== hashPassword)
      return res.status(StatusCodes.UNAUTHORIZED).end();

    const token = jwt.sign(
      {
        id: loginUser.id,
        email: loginUser.email,
      },
      process.env.PRIVATE_KEY,
      {
        expiresIn: '5m',
        issuer: 'songa',
      }
    );

    res.cookie('token', token, { httpOnly: true });

    return res.status(StatusCodes.OK).json({ message: '로그인 성공', token });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

const passwordResetRequest = async (req, res) => {
  const { email } = req.body;
  const connection = await conn();

  const sql = 'SELECT * FROM users WHERE email = ?';

  try {
    const [results] = await connection.query(sql, [email]);
    const user = results[0];

    if (user) {
      return res.status(StatusCodes.OK).json({ email });
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).end();
    }
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

const passwordReset = async (req, res) => {
  const { email, password } = req.body;
  const connection = await conn();

  const salt = crypto.randomBytes(64).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('base64');

  const sql = 'UPDATE users SET password=?, salt=? WHERE email = ?';
  const values = [hashPassword, salt, email];

  try {
    const [results] = await connection.execute(sql, values);
    if (results.affectedRows === 0)
      return res.status(StatusCodes.BAD_REQUEST).end();
    else return res.status(StatusCodes.CREATED).json(results);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

module.exports = {
  join,
  login,
  passwordResetRequest,
  passwordReset,
};
