const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeCartItem,
  getAllCartItems,
} = require('../controller/CartContraller');

router.use(express.json());

router.post('/', addToCart); // POST /carts
router.post('/items', getCartItems); // POST /carts/items 장바구니 아이템 목록 조회 / 선택된 장바구니 아이템 목록 조회
router.delete('/:id', removeCartItem); // DELETE /carts/:id
router.get('/', getAllCartItems); // GET /carts 전체 장바구니 조회

module.exports = router;
