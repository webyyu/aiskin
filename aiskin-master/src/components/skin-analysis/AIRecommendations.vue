<template>
  <div class="ai-recommendations-card">
    <div class="card-header">
      <h3 class="card-title">
        <font-awesome-icon icon="brain" class="title-icon" />
        AI智能护肤建议
      </h3>
      <div class="personalized-tag">
        <span class="tag-text">个性化定制</span>
      </div>
    </div>
    
    <div class="recommendations-list">
      <div 
        v-for="(recommendation, index) in recommendationCards" 
        :key="index"
        :class="['recommendation-card', recommendation.bgClass]"
      >
        <div :class="['decoration-circle', recommendation.decorationClass]"></div>
        <div class="card-content">
          <h4 class="recommendation-title">
            <div :class="['icon-container', recommendation.iconBgClass]">
              <font-awesome-icon :icon="recommendation.icon" class="rec-icon" />
            </div>
            {{ recommendation.title }}
          </h4>
          <p class="recommendation-description">{{ recommendation.description }}</p>
          <div class="tags-container">
            <span 
              v-for="tag in recommendation.tags" 
              :key="tag"
              :class="['tag', recommendation.tagClass]"
            >
              {{ tag }}
            </span>
          </div>
          <div :class="['info-container', recommendation.infoClass]">
            <font-awesome-icon :icon="recommendation.infoIcon" class="info-icon" />
            <span class="info-text">{{ recommendation.info }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIRecommendations',
  props: {
    recommendations: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    recommendationCards() {
      // 如果有实际的推荐数据，使用实际数据
      if (this.recommendations && this.recommendations.length > 0) {
        return this.recommendations.map((rec, index) => ({
          title: `建议 ${index + 1}`,
          description: rec,
          tags: ['AI建议'],
          info: '基于您的肌肤状况',
          icon: 'lightbulb',
          iconBgClass: 'blue-icon',
          bgClass: 'blue-bg',
          decorationClass: 'blue-decoration',
          tagClass: 'blue-tag',
          infoClass: 'blue-info',
          infoIcon: 'robot'
        }));
      }
      
      // 如果没有推荐数据，显示默认建议
      return [
        {
          title: '清洁护理方案',
          description: '建议使用温和的氨基酸洁面乳，早晚各一次，避免过度清洁导致水油失衡。',
          tags: ['氨基酸洁面', '温和清洁', 'pH平衡'],
          info: '建议使用频率：早晚各1次',
          icon: 'droplet',
          iconBgClass: 'blue-icon',
          bgClass: 'blue-bg',
          decorationClass: 'blue-decoration',
          tagClass: 'blue-tag',
          infoClass: 'blue-info',
          infoIcon: 'clock'
        },
        {
          title: '保湿护理方案',
          description: '选择适合您肤质的保湿产品，保持肌肤水润平衡。',
          tags: ['保湿', '补水', '锁水'],
          info: '建议使用频率：每日2次',
          icon: 'leaf',
          iconBgClass: 'emerald-icon',
          bgClass: 'emerald-bg',
          decorationClass: 'emerald-decoration',
          tagClass: 'emerald-tag',
          infoClass: 'emerald-info',
          infoIcon: 'map-marker-alt'
        },
        {
          title: '防晒护理方案',
          description: '每日使用SPF30+广谱防晒霜，保护肌肤免受紫外线伤害。',
          tags: ['防晒', '紫外线防护', 'SPF30+'],
          info: '建议使用频率：每日1次',
          icon: 'sun',
          iconBgClass: 'yellow-icon',
          bgClass: 'yellow-bg',
          decorationClass: 'yellow-decoration',
          tagClass: 'yellow-tag',
          infoClass: 'yellow-info',
          infoIcon: 'shield-alt'
        }
      ];
    }
  }
}
</script>

<style scoped>
.ai-recommendations-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.ai-recommendations-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 3s infinite;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  margin: 0;
}

.title-icon {
  color: #3B82F6;
  margin-right: 0.75rem;
  animation: float 3s ease-in-out infinite;
}

.personalized-tag {
  background: linear-gradient(to right, #DBEAFE, #EDE9FE);
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
}

.tag-text {
  font-size: 0.75rem;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recommendation-card {
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.blue-bg {
  background: linear-gradient(135deg, #EFF6FF, #F0F9FF);
  border-color: #BFDBFE;
}

.emerald-bg {
  background: linear-gradient(135deg, #ECFDF5, #F0FDF4);
  border-color: #A7F3D0;
}

.amber-bg {
  background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
  border-color: #FDE68A;
}

.purple-bg {
  background: linear-gradient(135deg, #F3F4F6, #FAF5FF);
  border-color: #DDD6FE;
}

.decoration-circle {
  position: absolute;
  top: 0;
  right: 0;
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  opacity: 0.2;
  margin-top: -2.5rem;
  margin-right: -2.5rem;
}

.blue-decoration {
  background-color: #BFDBFE;
}

.emerald-decoration {
  background-color: #A7F3D0;
}

.amber-decoration {
  background-color: #FDE68A;
}

.purple-decoration {
  background-color: #DDD6FE;
}

.card-content {
  position: relative;
  z-index: 10;
}

.recommendation-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
}

.icon-container {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.blue-icon {
  background-color: #3B82F6;
}

.emerald-icon {
  background-color: #10B981;
}

.amber-icon {
  background-color: #F59E0B;
}

.purple-icon {
  background-color: #8B5CF6;
}

.rec-icon {
  color: white;
  font-size: 0.875rem;
}

.recommendation-description {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 50px;
  font-weight: 500;
  border: 1px solid;
}

.blue-tag {
  background-color: #DBEAFE;
  color: #1D4ED8;
  border-color: #BFDBFE;
}

.emerald-tag {
  background-color: #D1FAE5;
  color: #047857;
  border-color: #A7F3D0;
}

.amber-tag {
  background-color: #FDE68A;
  color: #92400E;
  border-color: #F59E0B;
}

.purple-tag {
  background-color: #E9D5FF;
  color: #7C3AED;
  border-color: #C4B5FD;
}

.info-container {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.blue-info {
  color: #1E40AF;
}

.emerald-info {
  color: #047857;
}

.amber-info {
  color: #92400E;
}

.purple-info {
  color: #7C3AED;
}

.info-icon {
  margin-right: 0.5rem;
}

.info-text {
  margin: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 