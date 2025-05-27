const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeCartItem,
} = require('../controller/CartContraller');

router.use(express.json());

router.post('/', addToCart); // POST /carts
router.post('/items', getCartItems); // POST /carts/items 장바구니 아이템 목록 조회 / 선택된 장바구니 아이템 목록 조회
router.delete('/:id', removeCartItem); // DELETE /carts/:id

module.exports = router;
