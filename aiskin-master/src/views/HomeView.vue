<template>
  <div class="home-view">

    
    <AppHeader 
      title="喵喵护肤助手" 
      icon="paw" 
      right-icon="bell"
      bg-color="bg-sakura"
    >
      <SearchBar placeholder="搜索护肤品或成分喵~" />
    </AppHeader>

    <main class="main-content">
      <CoreFeatures @save-routine="handleSaveRoutine" />
      <TwentyOneDayPlanCard />
      <div v-if="loading">加载中...</div>
      <template v-else>
        <DailyRoutine 
          v-if="hasPlan"
          ref="dailyRoutine"
          :morning-routine="morningRoutine" 
          :evening-routine="eveningRoutine"
          :recommendations="recommendations"
          :planId="planId"
          @update:morningRoutine="morningRoutine = $event"
          @update:eveningRoutine="eveningRoutine = $event"
          @update:recommendations="recommendations = $event"
          @save-routine="saveRoutineToStorage" 
          @auto-checkin="handleAutoCheckin"
        />
        <div v-else class="no-plan">暂无护肤计划</div>
      </template>
    </main>

    <BottomNavigation />
  </div>
</template>

<script>
import { getAllPlans, getAllCheckinPlans, checkinTodayFor21Plan } from '@/api/planApi'
import AppHeader from '@/components/common/AppHeader.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import CoreFeatures from '@/components/home/CoreFeatures.vue'
import DailyRoutine from '@/components/home/DailyRoutine.vue'
import TwentyOneDayPlanCard from '@/components/home/TwentyOneDayPlanCard.vue'

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    SearchBar,
    BottomNavigation,
    CoreFeatures,
    DailyRoutine,
    TwentyOneDayPlanCard
  },
  data() {
    return {
      morningRoutine: [],
      eveningRoutine: [],
      recommendations: [],
      loading: true,
      hasPlan: false,
      planId: '',
      checkinPlanId: '' // 新增
    }
  },
  mounted() {
    this.fetchRoutine();
    this.fetchCheckinPlanId();
  },
  methods: {
    async fetchRoutine() {
      this.loading = true;
      try {
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        let plan;
        const currentPlanId = localStorage.getItem('currentPlanId');
        if (currentPlanId) {
          plan = plans.find(p => p._id === currentPlanId);
        }
        if (!plan && plans.length > 0) {
          plan = plans[0];
        }
        if (plan) {
          this.morningRoutine = plan.morning || [];
          this.eveningRoutine = plan.evening || [];
          this.recommendations = plan.recommendations || [];
          this.planId = plan._id || '';
          this.hasPlan = true;
        } else {
          this.hasPlan = false;
          this.planId = '';
        }
      } catch (e) {
        this.hasPlan = false;
        this.planId = '';
      }
      this.loading = false;
    },
    async fetchCheckinPlanId() {
      const token = localStorage.getItem('token');
      try {
        const plans = await getAllCheckinPlans(token);
        if (plans && plans.length > 0) {
          this.checkinPlanId = plans[0]._id || '';
        } else {
          this.checkinPlanId = '';
        }
      } catch (e) {
        this.checkinPlanId = '';
      }
    },
    handleSaveRoutine(routineData) {
      const dailyRoutineRef = this.$refs.dailyRoutine;
      if (dailyRoutineRef) {
        dailyRoutineRef.updateRoutine(routineData);
      } else {
        if (routineData.routines && routineData.routines.morning) {
          this.morningRoutine = routineData.routines.morning.map(step => ({
            done: false,
            product: step
          }));
        }
        if (routineData.routines && routineData.routines.evening) {
          this.eveningRoutine = routineData.routines.evening.map(step => ({
            done: false,
            product: step
          }));
        }
        if (routineData.recommendations) {
          this.recommendations = routineData.recommendations;
        }
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
        this.fetchCheckinPlanId();
      } catch (e) {
        this.$toast && this.$toast.error('自动打卡失败，请稍后重试');
      }
    },
    saveRoutineToStorage() {
      // 可选：如需本地保存可保留，否则可移除
    }
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #fff9fb;
  padding-bottom: 5rem;
}

.main-content {
  padding: 1rem;
}
.no-plan {
  text-align: center;
  color: #888;
  font-size: 1.2rem;
  margin-top: 2rem;
}
</style> 