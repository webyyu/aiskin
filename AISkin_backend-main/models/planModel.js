const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  step: Number,
  product: String,
  reason: String,
  completed: Boolean,
});

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  requirement: { type: String, default: '' },
  skinConcerns: [{ type: String }],
  customRequirements: { type: String, default: '' },
  userAge: { type: Number, required: true },
  userGender: { type: String, required: true },
  skinAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkinAnalysis', default: null },
  menstrualCycleInfo: { type: String, default: null },
  morning: [StepSchema],
  evening: [StepSchema],
  recommendations: [{ type: String }],
  skinAnalysisSummary: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  creatorNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  days: { type: Array, default: [] },
  notes: { type: String, default: '' }, // 备注/注释
  tags: [{ type: String, default: [] }],
  origin: { type: String, default: null },
});

module.exports = mongoose.model('Plan', planSchema); 