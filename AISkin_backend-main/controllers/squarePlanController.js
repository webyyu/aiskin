const SquarePlan = require('../models/squarePlanModel');

// 创建护肤方案
exports.createSquarePlan = async (req, res) => {
  try {
    const planData = req.body;
    planData.createdBy = req.user._id; // 假设已做身份验证
    planData.createdByName = req.user.name; // 假设user对象有name字段
    const plan = await SquarePlan.create(planData);
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 查询所有护肤广场方案（公开）
exports.getAllSquarePlans = async (req, res) => {
  try {
    // 支持分页参数
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 标签筛选
    let filter = {};
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim());
      filter.tags = { $all: tags }; // 同时包含所有标签
    }

    // 查询所有方案
    const plans = await SquarePlan.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 总数
    const total = await SquarePlan.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: plans,
      total,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 