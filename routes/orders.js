const express = require('express');
const {
  order,
  getOrders,
  getOrderDetail,
} = require('../controller/OrderController');
const router = express.Router();

router.use(express.json());

router.post('/', order);

router.get('/', getOrders);

router.get('/:id', getOrderDetail);

module.exports = router;
