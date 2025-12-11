const express = require('express');
const { createSquarePlan, getAllSquarePlans } = require('../controllers/squarePlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 公开获取所有护肤广场方案（无需登录）
router.get('/', getAllSquarePlans);

// 需要登录的路由
router.use(protect);
// 创建护肤方案
router.post('/', createSquarePlan);

module.exports = router; 