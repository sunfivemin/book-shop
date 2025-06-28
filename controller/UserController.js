const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const join = async (req, res) => {
  const { email, password } = req.body;
  const connection = await conn();

  const salt = crypto.randomBytes(64).toString('base64');
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('base64');

  const sql = 'INSERT INTO users (email, password, salt) VALUES (?, ?, ?)';
  const values = [email, hashPassword, salt];

  try {
    const [result] = await connection.execute(sql, values);
    return res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const connection = await conn();

  const sql = 'SELECT * FROM users WHERE email = ?';
  try {
    const [results] = await connection.query(sql, [email]);
    const loginUser = results[0];
    if (!loginUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: '존재하지 않는 사용자입니다.' });
    }

    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 64, 'sha512')
      .toString('base64');

    if (loginUser.password !== hashPassword) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 발급
    const token = jwt.sign(
      { id: loginUser.id, email: loginUser.email },
      process.env.PRIVATE_KEY,
      { expiresIn: '5m', issuer: 'songa' }
    );

    // 토큰을 httpOnly 쿠키에 저장
    res.cookie('token', token, { httpOnly: true });

    // user 정보 + token 반환
    return res.status(StatusCodes.OK).json({
      id: loginUser.id,
      email: loginUser.email,
      token,
      message: '로그인 성공',
    });
  } catch (err) {
    console.error('login 에러:', err);
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
