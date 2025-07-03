const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());

app.use(
  cors({
    origin: [
      'http://localhost:5173', // 개발용
      'https://book-store-three-tau-70.vercel.app/', // Vercel 배포 주소
    ],
    credentials: true,
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
