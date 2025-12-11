<template>
  <div class="weather-card">
    <div class="weather-header">
      <div class="weather-icon">
        <font-awesome-icon 
          :icon="getWeatherIcon()" 
          class="weather-svg"
        />
      </div>
      <div class="weather-info">
        <div class="city">{{ weatherData.city || '定位中...' }}</div>
        <div class="weather-desc">{{ weatherData.weather || '获取中...' }}</div>
      </div>
    </div>
    
    <div class="weather-details">
      <div class="detail-item">
        <div class="detail-label">温度</div>
        <div class="detail-value">{{ weatherData.temperature || '--' }}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">湿度</div>
        <div class="detail-value">{{ weatherData.humidity || '--' }}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">风力</div>
        <div class="detail-value">{{ weatherData.wind || '--' }}</div>
      </div>
    </div>
    
    <div class="weather-footer">
      <div class="update-time">
        最后更新: {{ formatUpdateTime() }}
      </div>
      <button 
        @click="refreshWeather" 
        class="refresh-btn"
        :disabled="isLoading"
      >
        <font-awesome-icon 
          :icon="isLoading ? 'spinner' : 'sync-alt'" 
          :class="{ 'fa-spin': isLoading }"
        />
        {{ isLoading ? '更新中...' : '刷新' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { mcpManager } from '@/config/mcp';

export default {
  name: 'WeatherCard',
  props: {
    // 可以传入初始天气数据
    initialWeather: {
      type: Object,
      default: () => ({})
    }
  },
  
  setup(props, { emit }) {
    const weatherData = ref({ ...props.initialWeather });
    const isLoading = ref(false);
    const lastUpdateTime = ref(new Date());

    // 获取天气图标
    const getWeatherIcon = () => {
      const weather = weatherData.value.weather || '';
      if (weather.includes('晴')) return 'sun';
      if (weather.includes('阴')) return 'cloud';
      if (weather.includes('雨')) return 'cloud-rain';
      if (weather.includes('雪')) return 'snowflake';
      if (weather.includes('雾')) return 'smog';
      return 'cloud-sun';
    };

    // 格式化更新时间
    const formatUpdateTime = () => {
      return lastUpdateTime.value.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 刷新天气信息
    const refreshWeather = async () => {
      if (isLoading.value) return;
      
      isLoading.value = true;
      try {
        // 获取用户IP
        const userIP = await mcpManager.getUserIP();
        if (userIP) {
          // 通过MCP获取天气信息
          const weather = await mcpManager.getWeatherByIP(userIP);
          if (weather) {
            weatherData.value = weather;
            lastUpdateTime.value = new Date();
            emit('weather-updated', weather);
          }
        }
      } catch (error) {
        console.error('刷新天气失败:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // 组件挂载时自动获取天气
    onMounted(async () => {
      if (!weatherData.value.city) {
        await refreshWeather();
      }
    });

    return {
      weatherData,
      isLoading,
      lastUpdateTime,
      getWeatherIcon,
      formatUpdateTime,
      refreshWeather
    };
  }
};
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.weather-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.weather-icon {
  margin-right: 16px;
}

.weather-svg {
  font-size: 48px;
  color: #ffd700;
}

.weather-info {
  flex: 1;
}

.city {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.weather-desc {
  font-size: 14px;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  text-align: center;
}

.detail-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
}

.weather-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.update-time {
  font-size: 12px;
  opacity: 0.7;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .weather-card {
    padding: 16px;
  }
  
  .weather-details {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  
  .weather-svg {
    font-size: 36px;
  }
  
  .city {
    font-size: 16px;
  }
}
</style> 
