const express = require('express');
const router = express.Router();
const conn = require('../mariadb');

const { allCategory } = require('../controller/CategoryController');

router.use(express.json());

router.put('/reset', allCategory);

module.exports = router;
