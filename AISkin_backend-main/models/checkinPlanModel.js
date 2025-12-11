const mongoose = require('mongoose');

const checkinPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  days: [{
    dayIndex: { type: Number, required: true },
    checked: { type: Boolean, default: false },
    imageUrl: { type: String }, // 用户上传的图片URL
    skinScore: { type: Number }, // 肌肤状态得分（百分制）
    moisture: { type: Number }, // 水分含量
    glossiness: { type: Number }, // 光泽度
    elasticity: { type: Number }, // 弹性
    problemAreaScore: { type: Number } // 问题区域评分，分越低越好
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('CheckinPlan', checkinPlanSchema); 