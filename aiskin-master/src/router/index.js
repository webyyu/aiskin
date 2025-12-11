import { createRouter, createWebHistory } from 'vue-router'
import SkinAnalysisResult from '@/views/SkinAnalysisResult.vue'
import SkinAnalysisComplete from '@/views/SkinAnalysisComplete.vue'
import TwentyOneDayPlan from '@/views/TwentyOneDayPlan.vue'
import SkincareSquare from '@/views/SkincareSquare.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/skin-analysis-complete'
  },
  {
    path: '/skin-analysis-result',
    name: 'SkinAnalysisResult',
    component: SkinAnalysisResult,
    meta: {
      title: '肌肤检测结果'
    }
  },
  {
    path: '/skin-analysis-complete',
    name: 'SkinAnalysisComplete',
    component: SkinAnalysisComplete,
    meta: {
      title: '完整肌肤分析'
    }
  },
  {
    path: '/twenty-one-day-plan',
    name: 'TwentyOneDayPlan',
    component: TwentyOneDayPlan,
    meta: {
      title: '21天护肤计划'
    }
  },
  {
    path: '/skincare-square',
    name: 'SkincareSquare',
    component: SkincareSquare,
    meta: {
      title: '护肤广场'
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router 