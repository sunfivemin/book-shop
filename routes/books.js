const express = require('express');
const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
  res.json('전체 조회 도서');
});

router.get('/:id', (req, res) => {
  res.json('개별 도서 조회');
});

router.get('/', (req, res) => {
  res.json('초기화');
});

module.exports = router;
