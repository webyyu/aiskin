const express = require('express');
const { createCheckinPlan, getUserCheckinPlans, getCheckinPlan, checkinDay, resetCheckinPlan } = require('../controllers/checkinPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 创建21天打卡计划
router.post('/', createCheckinPlan);
// 获取所有21天打卡计划
router.get('/', getUserCheckinPlans);
// 获取单个21天打卡计划
router.get('/:id', getCheckinPlan);
// 打卡/取消打卡
router.patch('/:id/checkin', checkinDay);
// 重置21天打卡计划（通过用户ID查找）
router.patch('/reset', resetCheckinPlan);

module.exports = router; 