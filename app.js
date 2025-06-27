const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173', // 또는 '*' (모든 도메인 허용)
    credentials: true, // 쿠키 포함 시 true로
  })
);
const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require('./routes/users');
const bookRouter = require('./routes/books');
const categoryRouter = require('./routes/category');
const likeRouter = require('./routes/likes');
const cartRouter = require('./routes/carts');
const orderRouter = require('./routes/orders');

app.use('/users', userRouter);
app.use('/books', bookRouter);
app.use('/category', categoryRouter);
app.use('/likes', likeRouter);
app.use('/carts', cartRouter);
app.use('/orders', orderRouter);
