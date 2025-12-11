const CheckinPlan = require('../models/checkinPlanModel');

// 创建21天打卡计划
const createCheckinPlan = async (req, res) => {
  try {
    const { planName, startDate } = req.body;
    if (!planName || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'planName和startDate为必填项'
      });
    }
    // 生成21天未打卡数组
    const days = Array.from({ length: 21 }, (_, i) => ({ dayIndex: i + 1, checked: false }));
    const plan = await CheckinPlan.create({
      name: planName,
      startDate,
      createdBy: req.user._id,
      days,
      createdAt: new Date(startDate),
      updatedAt: new Date(startDate)
    });
    return res.status(201).json({
      success: true,
      message: '21天打卡计划创建成功',
      data: { plan }
    });
  } catch (err) {
    console.error('创建21天打卡计划失败:', err);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};

// 获取当前用户所有21天打卡计划
const getUserCheckinPlans = async (req, res) => {
  try {
    const plans = await CheckinPlan.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: plans.length,
      data: { plans }
    });
  } catch (err) {
    console.error('获取打卡计划失败:', err);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};

// 获取单个21天打卡计划详情
const getCheckinPlan = async (req, res) => {
  try {
    const plan = await CheckinPlan.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '未找到该打卡计划'
      });
    }
    return res.status(200).json({
      success: true,
      data: { plan }
    });
  } catch (err) {
    console.error('获取打卡计划详情失败:', err);
    return res.status(500).json({
      success: false,
      message: '服务器错误',
      error: err.message
    });
  }
};

// 打卡/取消打卡某一天（根据日期自动判断）
const checkinDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, imageUrl, skinScore, moisture, glossiness, elasticity, problemAreaScore } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'date为必填项' });
    }
    const plan = await CheckinPlan.findOne({ _id: id, createdBy: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: '未找到该打卡计划' });
    }
    // 计算dayIndex
    const start = new Date(plan.startDate);
    const target = new Date(date);
    start.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24)) + 1;
    if (diff < 1 || diff > 21) {
      return res.status(400).json({ success: false, message: '日期不在打卡周期内' });
    }
    const day = plan.days.find(d => d.dayIndex === diff);
    if (!day) {
      return res.status(404).json({ success: false, message: '未找到对应的天数' });
    }
    // 新增：保存图片和评分信息
    if (imageUrl) day.imageUrl = imageUrl;
    if (typeof skinScore === 'number') day.skinScore = skinScore;
    if (typeof moisture === 'number') day.moisture = moisture;
    if (typeof glossiness === 'number') day.glossiness = glossiness;
    if (typeof elasticity === 'number') day.elasticity = elasticity;
    if (typeof problemAreaScore === 'number') day.problemAreaScore = problemAreaScore;
    if (!day.checked) {
      day.checked = true;
      plan.updatedAt = new Date();
      await plan.save();
    } else {
      // 如果已打卡但有新数据，也允许更新
      await plan.save();
    }
    return res.status(200).json({
      success: true,
      message: day.checked ? '打卡成功' : '已打过卡',
      data: { plan }
    });
  } catch (err) {
    console.error('打卡失败:', err);
    return res.status(500).json({ success: false, message: '服务器错误', error: err.message });
  }
};

// 重置21天打卡计划
const resetCheckinPlan = async (req, res) => {
  try {
    // 直接通过用户ID查找该用户的21天打卡计划
    const plan = await CheckinPlan.findOne({ createdBy: req.user._id });
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该用户的21天打卡计划' 
      });
    }

    // 重置days数组为初始状态
    const resetDays = Array.from({ length: 21 }, (_, i) => ({ 
      dayIndex: i + 1, 
      checked: false 
    }));

    // 更新计划
    plan.days = resetDays;
    plan.startDate = new Date(); // 重置开始日期为今天
    plan.updatedAt = new Date();
    
    await plan.save();

    console.log('✅ 21天打卡计划已重置，用户ID:', req.user._id, '计划ID:', plan._id);

    return res.status(200).json({
      success: true,
      message: '21天打卡计划重置成功',
      data: { 
        plan,
        resetInfo: {
          resetDate: new Date(),
          totalDays: 21,
          message: '所有打卡记录已清空，计划重新开始'
        }
      }
    });

  } catch (err) {
    console.error('重置打卡计划失败:', err);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误', 
      error: err.message 
    });
  }
};

module.exports = {
  createCheckinPlan,
  getUserCheckinPlans,
  getCheckinPlan,
  checkinDay,
  resetCheckinPlan
}; 