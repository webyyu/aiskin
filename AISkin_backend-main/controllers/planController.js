const axios = require('axios');
const Plan = require('../models/planModel');
const Product = require('../models/productModel');
const SkinAnalysis = require('../models/skinAnalysisModel');
const User = require('../models/userModel');
require('dotenv').config();

// 从环境变量中获取 API 密钥
const API_KEY = process.env.API_KEY;
// 生成个性化护肤方案
const generatePlan = async (req, res) => {
  try {
    const { requirement, skinConcerns, customRequirements, age } = req.body;
    
    console.log(`开始生成护肤方案，需求: ${requirement || '未指定'}`);

    // 获取用户完整信息
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户的所有产品
    const products = await Product.find({ createdBy: req.user._id });
    
    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: '未找到任何产品，无法生成护肤方案'
      });
    }

    // 获取用户最新的肌肤分析结果
    const latestSkinAnalysis = await SkinAnalysis.findOne({ 
      createdBy: req.user._id 
    }).sort({ createdAt: -1 });

    // 准备产品信息
    const productList = products.map(p => ({
      name: p.name,
      description: p.description || '',
      ingredients: p.ingredients || [],
      label: p.label || ''
    }));

    // 准备用户个人信息
    const userAge = age || user.age || 25; // 使用传入的年龄，或用户设置的年龄，或默认25岁
    const userGender = user.gender || 'female';
    
    // 准备肌肤状态信息
    let skinStatusInfo = '';
    if (latestSkinAnalysis) {
      skinStatusInfo = `
当前肌肤状态分析：
- 肌肤类型：${latestSkinAnalysis.skinType.type} (${latestSkinAnalysis.skinType.subtype})
- 健康评分：${latestSkinAnalysis.overallAssessment.healthScore}/100
- 肌肤状况：${latestSkinAnalysis.overallAssessment.skinCondition}
- 主要问题：
  * 黑头：${latestSkinAnalysis.blackheads.severity}
  * 痘痘：${latestSkinAnalysis.acne.count}
  * 毛孔：${latestSkinAnalysis.pores.severity}
- 分析总结：${latestSkinAnalysis.overallAssessment.summary}`;
    } else {
      skinStatusInfo = '暂无肌肤分析数据，请根据用户需求和年龄特点制定方案。';
    }

    // 准备生理周期信息（仅女性用户）
    let menstrualInfo = '';
    if (userGender === 'female' && user.menstrualCycle && user.menstrualCycle.isInCycle) {
      menstrualInfo = `
生理周期信息：
- 当前处于生理周期第${user.menstrualCycle.cycleDay}天
- 周期长度：${user.menstrualCycle.cycleLength}天
请考虑生理周期对肌肤状态的影响，在生理期前后肌肤可能更敏感，需要温和护理。`;
    }

    // 准备护肤需求信息
    const concernsText = skinConcerns && skinConcerns.length > 0 
      ? skinConcerns.join('、') 
      : '基础护肤';

    // 准备提示词
    const prompt = `
作为专业的护肤顾问，请为用户设计一套根据其具体情况定制的早晚护肤方案。

用户基本信息：
- 性别：${userGender === 'male' ? '男性' : '女性'}
- 年龄：${userAge}岁
- 主要护肤需求：${concernsText}
- 其他需求：${customRequirements || '无'}

${skinStatusInfo}

${menstrualInfo}

用户拥有的产品：
${productList.map((p, i) => `${i+1}. ${p.name} - ${p.label || '无标签'}`).join('\n')}

请用JSON格式输出一套完整的护肤方案，字段如下：
{
  "name": "方案名称（根据用户年龄、性别、肌肤状态和需求命名）",
  "requirement": "护肤需求（如有）",
  "skinConcerns": ["皮肤关注点1", "皮肤关注点2"],
  "customRequirements": "自定义需求（如有）",
  "userAge": 年龄,
  "userGender": "male/female",
  "skinAnalysisId": null,
  "menstrualCycleInfo": "如有请填写，无则为null",
  "morning": [
    {"step": 1, "product": "产品名称1", "reason": "使用理由", "completed": false}
  ],
  "evening": [
    {"step": 1, "product": "产品名称1", "reason": "使用理由", "completed": false}
  ],
  "recommendations": ["建议1", "建议2"],
  "skinAnalysisSummary": "基于当前肌肤分析的总结和建议",
  "creatorNote": "创作者备注，可为空",
  "notes": "用户补充说明，可为空",
  "tags": ["标签1", "标签2"]
}

请特别注意：
1. 字段必须齐全，类型与示例一致，不能缺少任何字段。
2. morning、evening每步都要有completed字段，默认为false。
3. tags、skinConcerns、recommendations等字段即使为空也要返回[]。
4. 输出必须是有效的JSON格式，不要添加任何多余的说明文字。`;

    console.log('发送方案生成请求到AI模型');

    // 调用通义千问API
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: 'qwen-turbo-latest',
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    console.log('AI模型返回方案结果');

    let planResult;
    try {
      // 提取JSON内容
      const content = response.data.choices[0].message.content;
      console.log(`AI返回原始结果: ${content}`);
      
      // 尝试解析JSON
      planResult = JSON.parse(content);
    } catch (error) {
      console.error('解析AI返回结果失败:', error);
      return res.status(500).json({
        success: false,
        message: 'AI返回结果解析失败',
        error: error.message
      });
    }

    // 保存方案到数据库
    // 给每个步骤加completed: false
    const morningWithCompleted = (planResult.morning || []).map(step => ({ ...step, completed: false }));
    const eveningWithCompleted = (planResult.evening || []).map(step => ({ ...step, completed: false }));
    const plan = await Plan.create({
      name: planResult.name,
      requirement: planResult.requirement || requirement || '',
      skinConcerns: planResult.skinConcerns || skinConcerns || [],
      customRequirements: planResult.customRequirements || customRequirements || '',
      userAge: planResult.userAge || userAge,
      userGender: planResult.userGender || userGender,
      skinAnalysisId: latestSkinAnalysis ? latestSkinAnalysis._id : null,
      menstrualCycleInfo: planResult.menstrualCycleInfo || null,
      morning: morningWithCompleted,
      evening: eveningWithCompleted,
      recommendations: planResult.recommendations || [],
      skinAnalysisSummary: planResult.skinAnalysisSummary || '',
      createdBy: req.user._id,
      createdByName: user.name || '',
      creatorNote: planResult.creatorNote || req.body.creatorNote || '',
      notes: planResult.notes || req.body.notes || '',
      tags: planResult.tags || req.body.tags || [],
      days: []
    });

    console.log(`护肤方案生成成功，ID: ${plan._id}`);

    return res.status(201).json({
      success: true,
      message: '护肤方案生成成功',
      data: {
        plan
      }
    });
  } catch (error) {
    console.error('生成护肤方案失败:', error);
    return res.status(500).json({
      success: false,
      message: '生成护肤方案失败',
      error: error.message
    });
  }
};

// 获取用户的所有护肤方案
const getUserPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: {
        plans
      }
    });
  } catch (error) {
    console.error('获取护肤方案失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取护肤方案失败',
      error: error.message
    });
  }
};

// 获取单个护肤方案
const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '未找到护肤方案'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        plan
      }
    });
  } catch (error) {
    console.error('获取护肤方案失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取护肤方案失败',
      error: error.message
    });
  }
};

// 删除护肤方案
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '未找到护肤方案'
      });
    }

    return res.status(200).json({
      success: true,
      message: '护肤方案删除成功',
      data: {}
    });
  } catch (error) {
    console.error('删除护肤方案失败:', error);
    return res.status(500).json({
      success: false,
      message: '删除护肤方案失败',
      error: error.message
    });
  }
};

// 更新护肤计划某个步骤的完成状态
const updateStepCompleted = async (req, res) => {
  try {
    const { planId } = req.params;
    const { period, step, completed } = req.body;
    if (!['morning', 'evening'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'period参数必须为morning或evening'
      });
    }
    // 查找当前用户的该计划
    const plan = await Plan.findOne({ _id: planId, createdBy: req.user._id });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: '未找到该护肤方案'
      });
    }
    // 找到对应period下的步骤
    const steps = plan[period];
    const idx = steps.findIndex(item => item.step === step);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: '未找到对应步骤'
      });
    }
    plan[period][idx].completed = completed;
    await plan.save();
    return res.status(200).json({
      success: true,
      message: '步骤完成状态已更新',
      data: { plan }
    });
  } catch (error) {
    console.error('更新步骤完成状态失败:', error);
    return res.status(500).json({
      success: false,
      message: '更新步骤完成状态失败',
      error: error.message
    });
  }
};

// 直接写入自定义护肤方案（不经过AI）
const createCustomPlan = async (req, res) => {
  try {
    // 从请求体获取所有字段
    const planData = req.body;
    // 自动补充用户ID和用户名
    planData.createdBy = req.user._id;
    planData.createdByName = req.user.name;
    // 创建方案
    const plan = await Plan.create(planData);
    return res.status(201).json({
      success: true,
      message: '自定义护肤方案创建成功',
      data: { plan }
    });
  } catch (error) {
    console.error('自定义护肤方案创建失败:', error);
    return res.status(400).json({
      success: false,
      message: '自定义护肤方案创建失败',
      error: error.message
    });
  }
};

module.exports = {
  generatePlan,
  getUserPlans,
  getPlan,
  deletePlan,
  updateStepCompleted,
  createCustomPlan
}; 