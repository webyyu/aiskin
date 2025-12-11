<template>
  <div class="twenty-one-day-plan-view">
    <!-- 顶部导航 -->
    <div class="glass-strong header">
      <div class="header-bar">
        <button class="icon-btn" @click="goBack">
          <font-awesome-icon icon="arrow-left" />
        </button>
        <h1>21天护肤计划</h1>
      </div>
      <div class="tab-bar">
        <div class="tab" :class="{active: currentTab==='overview'}" @click="currentTab='overview'">
          <font-awesome-icon icon="chart-pie" class="mr-1" />总览
        </div>
        <div class="tab" :class="{active: currentTab==='calendar'}" @click="currentTab='calendar'">
          <font-awesome-icon icon="calendar-alt" class="mr-1" />日历
        </div>
        <div class="tab" :class="{active: currentTab==='analysis'}" @click="currentTab='analysis'">
          <font-awesome-icon icon="chart-line" class="mr-1" />分析
        </div>
        <div class="tab-indicator" :style="indicatorStyle"></div>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 总览tab内容 -->
      <section v-show="currentTab==='overview'" class="glass-effect section animate-slide-up overview-hero">
        <div class="overview-hero-content">
          <div class="overview-hero-header">
            <div class="overview-hero-day">第 <span class="highlight">{{ signInDays }}</span> 天</div>
            <div class="overview-hero-sub">坚持护肤，见证蜕变</div>
            <div class="badge">
              <font-awesome-icon icon="fire" class="mr-1" />连续打卡 {{ signInDays }} 天
            </div>
          </div>
          <div class="overview-hero-progress">
            <div class="overview-hero-progress-labels">
              <span>进度</span>
              <span class="overview-hero-progress-percent">{{ Math.round(signInDays/21*100) }}%</span>
            </div>
            <div class="overview-hero-progress-bar">
              <div class="overview-hero-progress-inner" :style="{width: (signInDays/21*100)+'%'}"></div>
            </div>
          </div>
          <div class="overview-hero-stats">
            <div class="overview-hero-stat">
              <div class="stat-main green">{{ signInDays }}</div>
              <div class="stat-label">已完成</div>
              <div class="stat-tip green">+1 今日</div>
            </div>
            <div class="overview-hero-divider"></div>
            <div class="overview-hero-stat">
              <div class="stat-main blue">{{ 21-signInDays }}</div>
              <div class="stat-label">剩余天数</div>
              <div class="stat-tip blue">{{ Math.max(0, Math.round((21-signInDays)/21*100)) }}% 剩余</div>
            </div>
            <div class="overview-hero-divider"></div>
            <div class="overview-hero-stat">
              <div class="stat-main yellow">{{ Math.round(signInDays/21*100) }}%</div>
              <div class="stat-label">坚持率</div>
              <div class="stat-tip yellow">{{ signInDays === 21 ? '完美!' : '继续加油!' }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 成就徽章 -->
      <section v-show="currentTab==='overview'" class="glass-effect section">
        <h3 class="section-title">
          <font-awesome-icon icon="trophy" class="yellow mr-1" />成就徽章
          <span class="section-title-tip">3/12</span>
        </h3>
        <div class="badge-grid">
          <div class="badge-item badge-fire">
            <font-awesome-icon icon="fire" class="icon" />
            <div class="badge-label">连续7天</div>
            <div class="badge-desc">坚持不懈</div>
          </div>
          <div class="badge-item badge-star">
            <font-awesome-icon icon="star" class="icon" />
            <div class="badge-label">肌肤改善</div>
            <div class="badge-desc">效果显著</div>
          </div>
          <div class="badge-item badge-heart">
            <font-awesome-icon icon="heart" class="icon" />
            <div class="badge-label">自律达人</div>
            <div class="badge-desc">习惯养成</div>
          </div>
        </div>
        <div class="badge-more">查看全部成就 <font-awesome-icon icon="chevron-right" /></div>
      </section>

      <!-- 今日任务 -->
      <section v-show="currentTab==='overview'" class="glass-effect section">
        <h3 class="section-title">
          <font-awesome-icon icon="bullseye" class="red mr-1" />今日任务
        </h3>
        <div v-if="loadingTasks" class="task-list"><div>加载中...</div></div>
        <div v-else-if="taskError" class="task-list"><div style="color:#ef4444">{{taskError}}</div></div>
        <div v-else>
          <DailyRoutine
            v-if="morningRoutine.length || eveningRoutine.length"
            :morningRoutine="morningRoutine"
            :eveningRoutine="eveningRoutine"
            :planId="planId"
            @auto-checkin="handleAutoCheckin"
          />
          <div v-else style="color:#fff9">暂无今日任务</div>
          
          <!-- 添加每日照片上传任务 -->
          <div class="task-item" style="margin-top: 1rem;">
            <div class="task-circle" :class="{ checked: hasUploadedToday }">
              <font-awesome-icon v-if="hasUploadedToday" icon="check" class="circle-check" />
            </div>
            <div class="task-info">
              <div class="task-title">上传今日面部照片</div>
              <div class="task-desc">AI将分析您的肌肤状态变化</div>
            </div>
            <button v-if="!hasUploadedToday" class="task-btn" @click="$router.push('/skinstatus')">
              上传照片
            </button>
            <div v-else class="task-status green">已完成</div>
          </div>
        </div>
      </section>

      <!-- 日历tab内容（静态展示） -->
      <section v-show="currentTab==='calendar'" class="glass-effect section">
        <h3 class="section-title">
          <font-awesome-icon icon="calendar-alt" class="blue mr-1" />21天打卡日历
        </h3>
        <div class="calendar-grid">
          <div v-for="day in 21" :key="'day-'+day"
            :class="[
              'day-card',
              checkinDaysList[day-1]?.checked ? (day % 7 === 0 ? 'milestone' : 'completed') : (day % 7 === 0 ? 'milestone' : 'upcoming')
            ]">
            第{{day}}天
            <font-awesome-icon v-if="checkinDaysList[day-1]?.checked && day % 7 !== 0" icon="check" class="ml-1" />
            <font-awesome-icon v-if="checkinDaysList[day-1]?.checked && day % 7 === 0" icon="crown" class="ml-1" />
            <font-awesome-icon v-if="!checkinDaysList[day-1]?.checked && day % 7 === 0 && day !== 21" icon="star" class="ml-1" />
            <font-awesome-icon v-if="!checkinDaysList[day-1]?.checked && day !== 21 && day % 7 !== 0" icon="lock" class="ml-1" />
            <font-awesome-icon v-if="day === 21 && !checkinDaysList[day-1]?.checked" icon="trophy" class="ml-1" />
            <font-awesome-icon v-if="day === 21 && checkinDaysList[day-1]?.checked" icon="trophy" class="ml-1" />
          </div>
        </div>
        <!-- 周总结卡片 -->
        <div class="week-summary-grid">
          <div v-for="week in 3" :key="'week-'+week"
            :class="['week-summary-card',
              weekStats[week-1].finished === 7 ? 'finished' : (weekStats[week-1].finished > 0 ? 'ongoing' : 'upcoming')
            ]">
            <div :class="['week-icon',
              weekStats[week-1].finished === 7 ? 'finished' : (weekStats[week-1].finished > 0 ? 'ongoing' : 'upcoming')
            ]">
              <font-awesome-icon :icon="weekStats[week-1].finished === 7 ? 'check-circle' : (weekStats[week-1].finished > 0 ? 'clock' : 'lock')" />
            </div>
            <div class="week-title">第{{week}}周</div>
            <div class="week-status">
              {{ weekStats[week-1].finished === 7 ? '已完成' : (weekStats[week-1].finished > 0 ? '进行中' : '未开始') }}
            </div>
            <div :class="['week-progress',
              weekStats[week-1].finished === 7 ? 'finished' : (weekStats[week-1].finished > 0 ? 'ongoing' : 'upcoming')
            ]">
              {{ weekStats[week-1].finished }}/7天
            </div>
          </div>
        </div>
      </section>

      <!-- 分析tab内容（静态展示） -->
      <section v-show="currentTab==='analysis'" class="glass-effect section">
        <h3 class="section-title">
          <font-awesome-icon icon="chart-line" class="green mr-1" />21天肌肤情况走势
        </h3>
        <div v-if="!checkinPlanData" style="color:#fff9">暂无打卡计划数据</div>
        <div v-else>
          <!-- 7天走势图 -->
          <div class="trend-chart-container">
          <svg viewBox="0 0 400 200" width="100%" height="180" style="max-width:100%;">
            <defs>
              <linearGradient id="trendLineGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#22c55e"/>
                <stop offset="100%" stop-color="#16a34a"/>
              </linearGradient>
              <linearGradient id="trendFillGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#22c55e" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#16a34a" stop-opacity="0.01"/>
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#22c55e" flood-opacity="0.18"/>
              </filter>
            </defs>
            <!-- 渐变填充区域 -->
              <polygon v-if="chartData.length > 0" :points="chartPoints + ' 390,170 30,170'" fill="url(#trendFillGreen)" />
            <!-- 网格线 -->
            <g stroke="#fff4" stroke-width="1">
              <line x1="30" y1="50" x2="390" y2="50"/>
              <line x1="30" y1="90" x2="390" y2="90"/>
              <line x1="30" y1="130" x2="390" y2="130"/>
              <line x1="30" y1="170" x2="390" y2="170"/>
            </g>
            <!-- Y轴刻度 -->
            <g font-size="12" fill="#fff7">
              <text x="25" y="170" text-anchor="end">60</text>
              <text x="25" y="130" text-anchor="end">70</text>
              <text x="25" y="90" text-anchor="end">80</text>
              <text x="25" y="50" text-anchor="end">90</text>
            </g>
            <!-- 折线 -->
              <polyline v-if="chartData.length > 0" fill="none" stroke="url(#trendLineGreen)" stroke-width="6" filter="url(#shadow)"
                stroke-linecap="round" stroke-linejoin="round" :points="chartPoints" />
            <!-- 圆点和数值 -->
              <g v-for="(point, index) in chartData" :key="index" font-size="15" font-weight="bold">
                <circle :cx="30 + (index * (360 / Math.max(1, chartData.length - 1)))" 
                        :cy="170 - ((point.score / 100) * 120)" r="8" fill="#22c55e" stroke="#fff" stroke-width="3"/>
                <text :x="30 + (index * (360 / Math.max(1, chartData.length - 1)))" 
                      :y="170 - ((point.score / 100) * 120) - 10" text-anchor="middle" fill="#fff">{{ point.score }}</text>
            </g>
            <!-- X轴刻度 -->
            <g font-size="13" fill="#fff9">
                <text v-for="(point, index) in chartData" :key="index"
                      :x="30 + (index * (360 / Math.max(1, chartData.length - 1)))" y="190" text-anchor="middle">
                  {{ point.date }}
                </text>
            </g>
          </svg>
        </div>
        <!-- 综合评分卡片 -->
          <div v-if="latestAnalysis" class="score-card">
            <div class="score-main" style="margin-bottom: 0.2rem;">{{ latestAnalysis.skinScore }}</div>
          <div class="score-label">综合评分</div>
            <h2 class="score-title">第{{ latestAnalysis.dayIndex }}天状态</h2>
            <p class="score-desc">坚持打卡，肌肤状态持续改善中</p>
          <div class="improvement-badge">
            <font-awesome-icon icon="arrow-up" class="mr-1" />持续改善中
          </div>
        </div>
        <!-- 四项指标卡片 -->
          <div v-if="latestAnalysis" class="metric-grid">
          <div class="metric-card">
            <div class="metric-title">水分含量</div>
              <div class="metric-value">{{ latestAnalysis.moisture }}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">光泽度</div>
              <div class="metric-value">{{ latestAnalysis.glossiness }}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">弹性</div>
              <div class="metric-value">{{ latestAnalysis.elasticity }}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">问题区域</div>
              <div class="metric-value">{{ latestAnalysis.problemAreaScore }}%</div>
          </div>
        </div>
          <!-- 对比照片展示 -->
          <div v-if="comparisonPhotos.length > 0" class="comparison-photos-container">
            <h4 class="comparison-title">肌肤变化对比</h4>
            <div class="comparison-photos-grid">
              <div v-for="(photo, index) in comparisonPhotos" :key="index" class="comparison-photo-card">
                <img
                  :src="photo.imageUrl"
                  :alt="`第${photo.dayIndex}天照片`"
                  class="comparison-photo"
                  @click="previewPhoto(photo.imageUrl)"
                />
                <div class="photo-info">
                  <div class="photo-date">
                    第{{ photo.dayIndex }}天
          </div>
                  <div class="photo-score">
                    健康分：<span class="score-num">{{ photo.skinScore }}</span>
          </div>
        </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showCongrats" class="congrats-mask">
      <div class="congrats-dialog">
        <div class="congrats-icon">
          <font-awesome-icon icon="trophy" size="3x" />
        </div>
        <div class="congrats-title">恭喜你！</div>
        <div class="congrats-desc">你已连续完成21天护肤打卡，养成了好习惯！</div>
        <button class="congrats-btn" @click="showCongrats=false">开心收下</button>
      </div>
    </div>

    <div v-if="showCreatePlan" class="create-plan-mask">
      <div class="create-plan-dialog">
        <div class="create-plan-title">新建21天打卡计划</div>
        <div class="create-plan-form">
          <input v-model="newPlanName" class="create-plan-input" placeholder="请输入计划名称" />
          <input v-model="newStartDate" class="create-plan-input" type="date" />
        </div>
        <div class="create-plan-actions">
          <button class="create-plan-btn" @click="handleCreatePlan">创建</button>
          <button class="create-plan-btn cancel" @click="showCreatePlan=false">取消</button>
        </div>
        <div v-if="createPlanError" class="create-plan-error">{{createPlanError}}</div>
      </div>
    </div>

    <div v-if="showUploadDialog" class="upload-dialog-mask">
      <div class="upload-dialog">
        <div v-if="canUpload">
          <div class="upload-dialog-title">21天计划已完成</div>
          <div class="upload-dialog-desc">请完善并上传你的护肤方案</div>
          <input v-model="uploadForm.name" class="upload-input" maxlength="30" placeholder="请输入方案标题" style="width:100%;margin-bottom:0.7rem;" />
          <div class="upload-tags" style="margin-bottom:0.7rem;">
            <span v-for="tag in squareTags" :key="tag.label" :class="['tag', {active: uploadForm.tags.includes(tag.label)}]" @click="toggleUploadTag(tag.label)" style="margin-right:0.5rem;cursor:pointer;">
              <span class="tag-icon" style="margin-right:0.4em;">{{ tag.icon }}</span>{{ tag.label }}
            </span>
          </div>
          <textarea v-model="uploadForm.creatorNote" class="upload-textarea" maxlength="100" placeholder="请输入方案注释（可选）" style="width:100%;margin-bottom:0.7rem;"></textarea>
          <button class="upload-btn" @click="handleUploadToSquare">上传我的护肤方案</button>
          <button class="cancel-btn" @click="showUploadDialog=false">暂不上传</button>
        </div>
        <div v-else>
          <div class="upload-dialog-title">恭喜你完成了护肤计划！</div>
          <button class="cancel-btn" @click="showUploadDialog=false">知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllPlans, createCheckinPlan, getAllCheckinPlans, checkinTodayFor21Plan, uploadSquarePlan } from '@/api/planApi'
import axios from 'axios'
import DailyRoutine from '@/components/home/DailyRoutine.vue'

export default {
  name: 'TwentyOneDayPlan',
  data() {
    return {
      currentTab: 'overview',
      morningRoutine: [],
      eveningRoutine: [],
      loadingTasks: true,
      taskError: '',
      signInDays: 0, // 改为0，避免显示静态数据
      showCongrats: false,
      planId: '',
      showCreatePlan: false,
      newPlanName: '',
      newStartDate: '',
      createPlanError: '',
      checkinDaysList: [], // 新增，保存后端days数组
      checkinPlanId: '', // 新增，保存21天打卡计划ID
      showPhotoDialog: false, // 控制拍照/上传弹窗
      uploading: false,
      analysisResult: null,
      analysisError: '',
      analysisHistory: [], // 新增：存储最近7天的分析历史
      checkinPlanData: null, // 新增：存储21天打卡计划的完整数据
      mockUploadStatus: null, // 新增：模拟上传状态
      showUploadDialog: false, // 新增：完成21天后弹窗
      canUpload: false, // 新增：是否可上传
      uploadForm: { name: '', tags: [], creatorNote: '' }, // 新增：上传表单
      squareTags: [
        { label: '补水', icon: '💧' },
        { label: '美白', icon: '🌟' },
        { label: '抗老', icon: '🕰️' },
        { label: '控油', icon: '🧴' },
        { label: '修护', icon: '🛡️' },
        { label: '祛痘', icon: '🌱' }
      ], // 优化：每个标签带icon
    }
  },
  computed: {
    indicatorStyle() {
      // 0: overview, 1: calendar, 2: analysis
      const idx = ['overview', 'calendar', 'analysis'].indexOf(this.currentTab)
      return {
        left: `${idx * 33.33}%`
      }
    },
    // 在computed中新增weekStats，返回每周完成天数
    weekStats() {
      // 返回一个数组，每项为{ finished: 完成天数, total: 7 }
      const stats = [0, 0, 0];
      if (!this.checkinDaysList || this.checkinDaysList.length === 0) return stats.map(() => ({ finished: 0, total: 7 }));
      this.checkinDaysList.forEach(day => {
        if (day.checked) {
          const weekIdx = Math.floor((day.dayIndex - 1) / 7);
          if (weekIdx >= 0 && weekIdx < 3) stats[weekIdx]++;
        }
      });
      return stats.map(finished => ({ finished, total: 7 }));
    },
    chartData() {
      if (!this.checkinPlanData?.days || this.checkinPlanData.days.length === 0) return [];
      // 获取最近7天有数据的记录
      const validDays = this.checkinPlanData.days
        .filter(day => day.checked && day.skinScore)
        .slice(-7); // 取最后7天
      
      return validDays.map((day) => ({
        day: day.dayIndex,
        score: day.skinScore || 0,
        date: `${day.dayIndex}天`
      }));
    },
    chartPoints() {
      if (this.chartData.length === 0) return '';
      return this.chartData.map((point, index) => {
        const x = 30 + (index * (360 / Math.max(1, this.chartData.length - 1)));
        const y = 170 - ((point.score / 100) * 120);
        return `${x},${y}`;
      }).join(' ');
    },
    // 获取最新的分析数据（用于显示当前状态）
    latestAnalysis() {
      if (!this.checkinPlanData?.days) return null;
      const checkedDays = this.checkinPlanData.days.filter(day => day.checked && day.skinScore);
      return checkedDays.length > 0 ? checkedDays[checkedDays.length - 1] : null;
    },
    // 获取对比照片数据
    comparisonPhotos() {
      if (!this.checkinPlanData?.days) return [];
      
      const validDays = this.checkinPlanData.days.filter(day => day.checked && day.imageUrl);
      
      if (validDays.length === 0) return [];
      if (validDays.length === 1) return [validDays[0]];
      
      // 如果超过7天，取7天前和最新的
      if (validDays.length >= 7) {
        const sevenDaysAgo = validDays[validDays.length - 7];
        const latest = validDays[validDays.length - 1];
        return [sevenDaysAgo, latest];
      }
      
      // 如果不到7天，取第一张和最后一张
      return [validDays[0], validDays[validDays.length - 1]];
    },
    // 判断今天是否已上传照片
    hasUploadedToday() {
      if (!this.checkinPlanData?.days) return false;
      
      // 获取今天的天数索引（基于signInDays）
      const todayIndex = this.signInDays;
      
      // 找到对应天数的记录
      const todayRecord = this.checkinPlanData.days.find(day => 
        day.dayIndex === todayIndex && day.checked
      );
      
      // 如果有今天的记录且有图片，返回true
      return todayRecord && todayRecord.imageUrl;
    }
  },
  components: {
    DailyRoutine
  },
  mounted() {
    this.fetchPlanTasks();
    this.fetchSignInDays();
    this.fetchCheckinPlanData();
    // 新增：将当前21天计划ID缓存到localStorage
    if (this.checkinPlanId) {
      localStorage.setItem('checkinPlanId', this.checkinPlanId);
    }
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/');
      }
    },
    async fetchPlanTasks() {
      this.loadingTasks = true;
      this.taskError = '';
      try {
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        let latestPlan;
        const currentPlanId = localStorage.getItem('currentPlanId');
        if (currentPlanId) {
          latestPlan = plans.find(p => p._id === currentPlanId);
        }
        if (!latestPlan && plans.length > 0) {
          latestPlan = plans[0];
        }
        this.planId = latestPlan?._id || '';
        this.morningRoutine = (latestPlan?.morning || []);
        this.eveningRoutine = (latestPlan?.evening || []);
      } catch (e) {
        this.taskError = '获取今日任务失败';
      } finally {
        this.loadingTasks = false;
      }
    },
    async toggleTask(period, index) {
      const routine = period === 'morning' ? this.morningRoutine : this.eveningRoutine;
      const item = routine[index];
      const token = localStorage.getItem('token');
      try {
        const res = await axios.patch(`/api/plans/${this.planId}/step`, {
          period,
          step: item.step,
          completed: !item.completed
        }, {
          headers: { Authorization: 'Bearer ' + token }
        });
        const plan = res.data.data.plan;
        this.morningRoutine = plan.morning || [];
        this.eveningRoutine = plan.evening || [];
        // 检查所有任务是否都完成，若完成则自动打卡
        const allDone = [...this.morningRoutine, ...this.eveningRoutine].every(t => t.completed);
        if (allDone && this.checkinPlanId) {
          try {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            await checkinTodayFor21Plan(token, this.checkinPlanId, dateStr);
            this.$toast && this.$toast.success('今日已自动打卡！');
            this.fetchSignInDays();
            this.fetchPlanTasks();
          } catch (e) {
            this.$toast && this.$toast.error('自动打卡失败，请稍后重试');
          }
        }
      } catch (e) {
        alert('同步失败，请重试');
      }
    },
    signInDemo() {
      if (this.signInDays < 21) {
        this.signInDays++;
        if (this.signInDays === 21) {
          this.showCongrats = true;
        }
      }
    },
    async handleCreatePlan() {
      this.createPlanError = '';
      if (!this.newPlanName || !this.newStartDate) {
        this.createPlanError = '请填写完整信息';
        return;
      }
      const token = localStorage.getItem('token');
      try {
        await createCheckinPlan(token, this.newPlanName, this.newStartDate);
        this.showCreatePlan = false;
        this.newPlanName = '';
        this.newStartDate = '';
        this.$toast && this.$toast.success('创建成功');
        this.fetchPlanTasks();
        this.fetchSignInDays(); // 创建新计划后也更新签到天数
      } catch (e) {
        this.createPlanError = '创建失败，请重试';
      }
    },
    async fetchSignInDays() {
      const token = localStorage.getItem('token');
      try {
        const plans = await getAllCheckinPlans(token);
        if (plans && plans.length > 0) {
          // 取最新一个计划
          const latest = plans[0];
          // days为21天数组，checked为true表示已签到
          this.signInDays = (latest.days || []).filter(d => d.checked).length;
          this.checkinDaysList = latest.days || [];
          this.checkinPlanId = latest._id || '';
          // 新增：21天完成后弹窗
          if (this.signInDays === 21) {
            // 判断是否可上传（例：最后一天分数>第一天分数）
            const days = latest.days || [];
            const first = days[0]?.skinScore;
            const last = days[20]?.skinScore;
            this.canUpload = (typeof first === 'number' && typeof last === 'number' && last > first);
            this.showUploadDialog = true;
          }
        } else {
          this.signInDays = 0;
          this.checkinDaysList = [];
          this.checkinPlanId = '';
        }
      } catch (e) {
        this.signInDays = 0;
        this.checkinDaysList = [];
        this.checkinPlanId = '';
      }
    },
    async handleAutoCheckin() {
      if (!this.checkinPlanId) return;
      const token = localStorage.getItem('token');
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        await checkinTodayFor21Plan(token, this.checkinPlanId, dateStr);
        this.$toast && this.$toast.success('今日已自动打卡！');
        this.fetchSignInDays();
        this.fetchPlanTasks();
        // 打卡成功后弹出拍照弹窗
        this.showPhotoDialog = true;
      } catch (e) {
        this.$toast && this.$toast.error('自动打卡失败，请稍后重试');
      }
    },
    async fetchCheckinPlanData() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/checkin-plans', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        if (result.success && result.data.plans.length > 0) {
          this.checkinPlanData = result.data.plans[0]; // 取最新的计划
        }
      } catch (e) {
        console.error('获取打卡计划数据失败:', e);
      }
    },
    async handleUploadToSquare() {
      // 校验
      if (!this.uploadForm.name.trim()) {
        this.$toast && this.$toast.error('请填写方案标题');
        return;
      }
      if (!this.uploadForm.tags.length) {
        this.$toast && this.$toast.error('请选择至少一个标签');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$toast && this.$toast.error('请先登录');
          return;
        }
        // 获取当前护肤方案（plans数据集）
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        let currentPlan;
        const currentPlanId = localStorage.getItem('currentPlanId');
        if (currentPlanId) {
          currentPlan = plans.find(p => p._id === currentPlanId);
        }
        if (!currentPlan && plans.length > 0) {
          currentPlan = plans[0];
        }
        if (!currentPlan) {
          this.$toast && this.$toast.error('未找到当前护肤方案');
          return;
        }
        // 组装上传数据
        const planData = {
          name: this.uploadForm.name,
          tags: this.uploadForm.tags,
          creatorNote: this.uploadForm.creatorNote,
          userAge: currentPlan.userAge || 20,
          userGender: currentPlan.userGender || 'female',
          morning: currentPlan.morning || [],
          evening: currentPlan.evening || [],
          recommendations: currentPlan.recommendations || [],
          requirement: currentPlan.requirement || '',
          skinConcerns: currentPlan.skinConcerns || [],
          customRequirements: currentPlan.customRequirements || '',
          notes: currentPlan.notes || ''
        };
        await uploadSquarePlan(planData, token);
        this.$toast && this.$toast.success('上传成功，已发布到护肤广场！');
        this.showUploadDialog = false;
        this.uploadForm = { name: '', tags: [], creatorNote: '' };
      } catch (e) {
        this.$toast && this.$toast.error(e.response?.data?.message || '上传失败，请重试');
      }
    },
    previewPhoto(url) {
      window.open(url, '_blank');
    },
    toggleUploadTag(label) {
      const idx = this.uploadForm.tags.indexOf(label);
      if (idx > -1) {
        this.uploadForm.tags.splice(idx, 1);
      } else {
        this.uploadForm.tags.push(label);
      }
    },
  }
}
</script>

<style scoped>
.twenty-one-day-plan-view {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  min-height: 100vh;
  padding-bottom: 2rem;
}
.glass-strong {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(25px);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header {
  border-radius: 0 0 24px 24px;
  margin-bottom: 1rem;
}
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem 0.5rem 1.2rem;
}
.header-bar h1 {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
  text-align: center;
}
.header-actions {
  display: flex;
  gap: 0.7rem;
}
.icon-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.3rem;
}
.tab-bar {
  display: flex;
  position: relative;
  background: none;
  margin-top: 0.5rem;
}
.tab {
  flex: 1;
  text-align: center;
  color: #fff9;
  font-weight: 500;
  padding: 0.7rem 0;
  cursor: pointer;
  position: relative;
  font-size: 1rem;
}
.tab.active {
  color: #fff;
}
.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 33.33%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: all 0.3s;
}
.main-content {
  padding: 1.2rem 0.7rem 0 0.7rem;
}
.glass-effect {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  border-radius: 24px;
  margin-bottom: 1.2rem;
  padding: 1.5rem 1.2rem;
}
.section-title {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.section-title-tip {
  margin-left: auto;
  font-size: 0.95rem;
  color: #ffd700;
}
.section-title-tip.green {
  color: #10b981;
}
.section-title-tip.yellow {
  color: #fbbf24;
}
.section-title-tip.red {
  color: #ef4444;
}
.day-title {
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}
.day-title .highlight {
  color: #fbbf24;
}
.subtitle {
  color: #fff9;
  font-size: 1.1rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  background: #10b98133;
  color: #6ee7b7;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  margin-top: 0.7rem;
}
.progress-text {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.progress-text .percent {
  font-size: 2.5rem;
  font-weight: bold;
}
.progress-text .desc {
  font-size: 1rem;
  opacity: 0.8;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.2rem;
}
.stat-card {
  background: #fff2;
  border-radius: 18px;
  padding: 1rem 0.5rem;
  text-align: center;
}
.stat-main {
  font-size: 1.5rem;
  font-weight: bold;
}
.stat-main.green { color: #6ee7b7; }
.stat-main.blue { color: #60a5fa; }
.stat-main.yellow { color: #fde68a; }
.stat-label {
  color: #fff9;
  font-size: 0.95rem;
}
.stat-tip {
  font-size: 0.85rem;
  margin-top: 0.2rem;
}
.stat-tip.green { color: #6ee7b7; }
.stat-tip.blue { color: #60a5fa; }
.stat-tip.yellow { color: #fde68a; }

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.badge-item {
  background: linear-gradient(135deg, #fbbf24, #f59e42);
  border-radius: 16px;
  padding: 1.1rem 0.5rem;
  text-align: center;
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 2px 8px #fbbf2433;
}
.badge-fire {
  background: linear-gradient(135deg, #fbbf24, #f59e42);
}
.badge-star {
  background: linear-gradient(135deg, #34d399, #10b981);
}
.badge-heart {
  background: linear-gradient(135deg, #a78bfa, #f472b6);
}
.badge-item .icon {
  font-size: 1.5rem;
  margin-bottom: 0.3rem;
}
.badge-label {
  font-size: 0.95rem;
  font-weight: 600;
}
.badge-desc {
  font-size: 0.85rem;
  opacity: 0.8;
}
.badge-more {
  color: #fff9;
  text-align: center;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  cursor: pointer;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.task-item {
  display: flex;
  align-items: center;
  background: #fff2;
  border-radius: 14px;
  padding: 0.8rem 0.7rem;
}
.task-item.done {
  opacity: 0.7;
}
.task-circle {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.8rem;
  border: 2px solid #e5e7eb;
  background: rgba(255,255,255,0.18);
  transition: all 0.2s;
}
.task-circle.yellow {
  border-color: #fbbf24;
}
.task-circle.blue {
  border-color: #60a5fa;
}
.task-circle.checked {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: #22c55e;
  box-shadow: 0 2px 8px #22c55e22;
}
.circle-check {
  color: #fff;
  font-size: 1rem;
}
.task-info {
  flex: 1;
}
.task-title {
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
}
.task-desc {
  color: #fff9;
  font-size: 0.92rem;
}
.task-status {
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 1rem;
}
.task-status.green {
  color: #10b981;
}
.task-btn {
  background: #fbbf24;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.task-btn.yellow:hover {
  background: #f59e42;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-top: 0.7rem;
}
.day-card {
  background: #fff2;
  border-radius: 12px;
  padding: 0.7rem 0.2rem;
  text-align: center;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}
.day-card.completed {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}
.day-card.current {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: 0 0 12px #fbbf2444;
}
.day-card.upcoming {
  background: rgba(255,255,255,0.08);
  color: #fff9;
  border: 2px dashed rgba(255,255,255,0.3);
}
.day-card.milestone {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fff;
}

.trend-chart-placeholder {
  background: rgba(255,255,255,0.18);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(34,197,94,0.10);
  padding: 1.5rem 1rem 1rem 1rem;
  margin-bottom: 1.5rem;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff9;
  font-size: 1.1rem;
}
.compare-photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  margin-top: 1rem;
}
.compare-photo {
  background: linear-gradient(135deg, #a1a1aa, #f472b6);
  border-radius: 18px;
  padding: 1.2rem 0.5rem;
  text-align: center;
  color: #fff;
  position: relative;
}
.compare-photo.before {
  background: linear-gradient(135deg, #a1a1aa, #6366f1);
}
.compare-photo.after {
  background: linear-gradient(135deg, #f472b6, #a78bfa);
}
.photo-icon {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}
.photo-label {
  font-size: 1rem;
  font-weight: 600;
}
.photo-desc {
  font-size: 0.9rem;
  opacity: 0.8;
}

.week-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.2rem 0 0.5rem 0;
}
.week-summary-card {
  background: rgba(255,255,255,0.13);
  border-radius: 18px;
  padding: 1.1rem 0.5rem;
  text-align: center;
  color: #fff;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.week-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.week-icon.finished {
  background: #10b98133;
  color: #6ee7b7;
}
.week-icon.ongoing {
  background: #fbbf2433;
  color: #fbbf24;
}
.week-icon.upcoming {
  background: #a1a1aa33;
  color: #a1a1aa;
}
.week-title {
  font-size: 1.05rem;
  font-weight: 600;
}
.week-status {
  color: #fff9;
  font-size: 0.95rem;
}
.week-progress {
  font-size: 0.92rem;
  margin-top: 0.2rem;
}
.week-progress.finished {
  color: #6ee7b7;
}
.week-progress.ongoing {
  color: #fbbf24;
}
.week-progress.upcoming {
  color: #a1a1aa;
}

.score-card {
  background: rgba(255,255,255,0.13);
  border-radius: 18px;
  padding: 1.2rem 0.5rem 1.5rem 0.5rem;
  text-align: center;
  color: #fff;
  margin: 1.2rem 0;
  box-shadow: 0 2px 8px #0001;
}
.score-text {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.score-main {
  font-size: 2.2rem;
  font-weight: bold;
}
.score-label {
  font-size: 1rem;
  opacity: 0.8;
}
.score-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.score-desc {
  color: #fff9;
  font-size: 1rem;
  margin-bottom: 0.7rem;
}
.improvement-badge {
  display: inline-flex;
  align-items: center;
  background: #10b98133;
  color: #6ee7b7;
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  font-size: 0.95rem;
}
.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.2rem 0;
}
.metric-card {
  background: rgba(255,255,255,0.13);
  border-radius: 16px;
  padding: 1.1rem 0.7rem 1rem 0.7rem;
  text-align: center;
  color: #fff;
  box-shadow: 0 2px 8px #0001;
  position: relative;
}
.metric-icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin: 0 auto 0.5rem auto;
}
.metric-icon.blue { background: #3b82f633; color: #3b82f6; }
.metric-icon.yellow { background: #fbbf2433; color: #fbbf24; }
.metric-icon.purple { background: #a78bfa33; color: #a78bfa; }
.metric-icon.red { background: #ef444433; color: #ef4444; }
.metric-title {
  font-size: 1rem;
  font-weight: 600;
}
.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.2rem 0;
}
.metric-bar {
  width: 100%;
  height: 0.7rem;
  background: #fff2;
  border-radius: 8px;
  margin: 0.5rem 0 0.2rem 0;
  overflow: hidden;
}
.metric-bar-inner {
  height: 100%;
  border-radius: 8px;
}
.metric-bar-inner.blue { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.metric-bar-inner.yellow { background: linear-gradient(90deg, #fbbf24, #fde68a); }
.metric-bar-inner.purple { background: linear-gradient(90deg, #a78bfa, #f472b6); }
.metric-bar-inner.red { background: linear-gradient(90deg, #ef4444, #fca5a5); }
.metric-tip {
  font-size: 0.92rem;
  color: #fff9;
}
.metric-change {
  font-size: 0.9rem;
  margin-top: 0.2rem;
  color: #10b981;
}
.detail-report {
  margin-top: 1.5rem;
  padding: 1.2rem 1rem;
}
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.detail-item {
  background: #fff2;
  border-radius: 14px;
  padding: 1rem 0.7rem;
  color: #fff;
  position: relative;
}
.detail-item.blue { border-left: 4px solid #3b82f6; }
.detail-item.green { border-left: 4px solid #10b981; }
.detail-item.red { border-left: 4px solid #ef4444; }
.detail-title {
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.detail-badge {
  display: inline-block;
  background: #10b98133;
  color: #6ee7b7;
  border-radius: 999px;
  font-size: 0.92rem;
  padding: 0.2rem 0.8rem;
  margin-left: 0.7rem;
}
.detail-desc {
  font-size: 0.95rem;
  color: #fff9;
  margin: 0.5rem 0 0.2rem 0;
}
.detail-change {
  font-size: 0.92rem;
  color: #10b981;
  display: flex;
  align-items: center;
}
.detail-change .fa-arrow-down { color: #ef4444; }

.overview-hero {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.10);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 2rem;
  padding: 2.2rem 1.2rem 1.7rem 1.2rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}
.overview-hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.overview-hero-header {
  text-align: center;
  margin-bottom: 1.2rem;
}
.overview-hero-day {
  font-size: 2.3rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.2rem;
}
.overview-hero-day .highlight {
  color: #fbbf24;
}
.overview-hero-sub {
  color: #fff;
  font-size: 1.15rem;
  margin-bottom: 0.7rem;
}
.overview-hero-progress {
  width: 100%;
  margin-bottom: 1.2rem;
}
.overview-hero-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #fff;
  margin-bottom: 0.2rem;
}
.overview-hero-progress-percent {
  font-weight: bold;
}
.overview-hero-progress-bar {
  width: 100%;
  height: 0.7rem;
  background: #fff3;
  border-radius: 8px;
  overflow: hidden;
}
.overview-hero-progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  border-radius: 8px;
  transition: width 0.5s;
}
.overview-hero-stats {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: stretch;
  margin-top: 1.2rem;
}
.overview-hero-stat {
  flex: 1;
  text-align: center;
}
.overview-hero-divider {
  width: 1px;
  background: linear-gradient(180deg, #fff3, #fff0);
  margin: 0 0.5rem;
}

.calendar-signin-demo {
  display: flex;
  justify-content: center;
  margin-top: 1.2rem;
}
.calendar-signin-btn {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 999px;
  padding: 0.7rem 2.2rem;
  box-shadow: 0 2px 8px #fbbf2433;
  cursor: pointer;
  transition: background 0.2s;
}
.calendar-signin-btn:hover {
  background: linear-gradient(90deg, #f18a8a, #fbbf24);
}

.congrats-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.congrats-dialog {
  background: #fff;
  border-radius: 1.5rem;
  padding: 2.2rem 2rem 1.5rem 2rem;
  box-shadow: 0 8px 32px #0002;
  text-align: center;
  min-width: 260px;
  max-width: 90vw;
}
.congrats-icon {
  color: #fbbf24;
  margin-bottom: 1.2rem;
}
.congrats-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f18a8a;
  margin-bottom: 0.7rem;
}
.congrats-desc {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
}
.congrats-btn {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 2.2rem;
  box-shadow: 0 2px 8px #fbbf2433;
  cursor: pointer;
  transition: background 0.2s;
}
.congrats-btn:hover {
  background: linear-gradient(90deg, #f18a8a, #fbbf24);
}

/* 任务分组样式优化 */
.task-group {
  margin-bottom: 1.2rem;
}
.task-group-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}
.create-plan-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.create-plan-dialog {
  background: #fff;
  border-radius: 1.5rem;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  box-shadow: 0 8px 32px #0002;
  text-align: center;
  min-width: 260px;
  max-width: 90vw;
}
.create-plan-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #f18a8a;
  margin-bottom: 1rem;
}
.create-plan-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.create-plan-input {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px solid #eee;
  font-size: 1rem;
  outline: none;
}
.create-plan-actions {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  margin-bottom: 0.7rem;
}
.create-plan-btn {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 2rem;
  box-shadow: 0 2px 8px #fbbf2433;
  cursor: pointer;
  transition: background 0.2s;
}
.create-plan-btn.cancel {
  background: #eee;
  color: #f18a8a;
}
.create-plan-error {
  color: #ef4444;
  font-size: 0.98rem;
  margin-top: 0.5rem;
}
.upload-dialog-mask {
  position: fixed; left:0; top:0; right:0; bottom:0;
  background: rgba(0,0,0,0.45);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.upload-dialog {
  background: #fff;
  border-radius: 1.2rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 8px 32px #0002;
  text-align: center;
  min-width: 260px;
  max-width: 90vw;
}
.upload-dialog-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #f18a8a;
  margin-bottom: 1rem;
}
.upload-dialog-desc {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
}
.upload-dialog .upload-btn {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 2.2rem;
  margin: 0.5rem 0.7rem 0.5rem 0;
  box-shadow: 0 2px 8px #fbbf2433;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-dialog .cancel-btn {
  background: #eee;
  color: #f18a8a;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  border-radius: 999px;
  padding: 0.6rem 2.2rem;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: background 0.2s;
}
.upload-tags .tag.active {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
}
.upload-input {
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  outline: none;
}
.upload-textarea {
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  min-height: 60px;
  outline: none;
  resize: vertical;
}

.upload-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.upload-tags .tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 0.5rem 1.3rem;
  font-size: 1.05rem;
  border-radius: 999px;
  background: #f3f4f6;
  color: #e75480;
  border: 2px solid #fbbf24;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  box-shadow: 0 2px 8px #fbbf2422;
  position: relative;
  user-select: none;
}
.upload-tags .tag:hover {
  background: #fde68a;
  color: #fff;
  border-color: #fbbf24;
}
.upload-tags .tag.active {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  border-color: #f18a8a;
  box-shadow: 0 4px 16px #fbbf2444;
}
.upload-tags .tag.active::after {
  content: '✔';
  font-size: 0.95rem;
  color: #fff;
  margin-left: 0.5rem;
}

.tag-icon {
  font-size: 1.1em;
  vertical-align: middle;
}
</style> 