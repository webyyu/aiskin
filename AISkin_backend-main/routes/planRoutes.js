const express = require('express');
const { 
  generatePlan,
  getUserPlans,
  getPlan,
  deletePlan,
  updateStepCompleted,
  createCustomPlan
} = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有路由都需要身份验证
router.use(protect);

// 生成护肤方案
router.post('/', generatePlan);

// 获取用户的所有护肤方案
router.get('/', getUserPlans);

// 获取单个护肤方案 / 删除护肤方案
router.route('/:id')
  .get(getPlan)
  .delete(deletePlan);

// 更新护肤计划某个步骤的完成状态
router.patch('/:planId/step', updateStepCompleted);

// 新增：直接写入自定义护肤方案（不经过AI）
router.post('/custom', createCustomPlan);

module.exports = router; 