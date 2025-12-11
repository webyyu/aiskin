<template>
  <div class="skincare-square-view">
    <header class="square-header">
      <h1 class="header-title">
        <font-awesome-icon :icon="['fas', 'paw']" class="header-icon" />
        护肤广场
      </h1>
    </header>
    <div class="tag-bar">
      <span v-for="tag in tags" :key="tag" :class="['tag', {active: tag === selectedTag}]" @click="selectTag(tag)">{{ tag }}</span>
      <button class="my-plans-btn" @click="openMyPlans">我的方案</button>
    </div>
    <div class="plan-list">
      <div v-for="plan in filteredPlans" :key="plan.id" class="plan-card" @click="showPlanDetail(plan)">
        <div class="plan-title">{{ plan.title }}</div>
        <div class="plan-tags">
          <span v-for="tag in plan.tags" :key="tag" class="plan-tag">#{{ tag }}</span>
        </div>
        <div class="plan-desc">{{ plan.desc }}</div>
        <!-- 收藏按钮已移除，仅保留写入我的方案按钮 -->
        <button class="fav-btn" style="margin-top: 0.3rem; background: #fbbf24;" @click.stop="handleAddToMyPlans(plan)" :disabled="isAlreadyAdded(plan)">
          {{ isAlreadyAdded(plan) ? '已拉入' : '拉入我的方案' }}
        </button>
      </div>
    </div>
    <!-- 其他模态框保持不变 -->
    <div v-if="showDetail" class="plan-detail-modal-mask" @click.self="showDetail = false">
      <div class="plan-detail-modal">
        <div class="detail-header">
          <span class="detail-title">{{ detailPlan.title }}</span>
          <button class="close-btn" @click="showDetail = false">×</button>
        </div>
        <div class="detail-tags">
          <span v-for="tag in detailPlan.tags" :key="tag" class="plan-tag">#{{ tag }}</span>
        </div>
        <div class="detail-desc">{{ detailPlan.desc }}</div>
        <div class="detail-meta">
          <span v-if="detailPlan.raw && detailPlan.raw.createdByName">创建者：{{ detailPlan.raw.createdByName }}</span>
          <span v-if="detailPlan.raw && detailPlan.raw.createdAt">｜创建时间：{{ formatDate(detailPlan.raw.createdAt) }}</span>
        </div>
        <div v-if="detailPlan.raw && (detailPlan.raw.morning?.length || detailPlan.raw.evening?.length)" class="detail-steps">
          <div v-if="detailPlan.raw.morning?.length" class="step-section">
            <div class="step-title">早间护理</div>
            <ul>
              <li v-for="(step, idx) in detailPlan.raw.morning" :key="'m'+idx">
                <span class="step-product">{{ step.product }}</span>
                <span class="step-reason">{{ step.reason }}</span>
              </li>
            </ul>
          </div>
          <div v-if="detailPlan.raw.evening?.length" class="step-section">
            <div class="step-title">晚间护理</div>
            <ul>
              <li v-for="(step, idx) in detailPlan.raw.evening" :key="'e'+idx">
                <span class="step-product">{{ step.product }}</span>
                <span class="step-reason">{{ step.reason }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="fav-tip" v-if="myFavorites.length >= 10">收藏上限为10个方案</div>
    <div v-if="showMyPlans" class="my-plans-modal-mask" @click.self="showMyPlans = false">
      <div class="my-plans-modal">
        <div class="my-plans-header">
          <span>我的方案（{{ myPlans.length }}）</span>
          <button class="close-btn" @click="showMyPlans = false">×</button>
        </div>
        <div v-if="myPlans.length === 0" class="empty-tip">暂无方案</div>
        <div v-else class="my-plans-list">
          <div v-for="plan in myPlans" :key="plan.id" class="my-plan-item">
            <div class="plan-title">{{ plan.title }}</div>
            <div class="plan-tags">
              <span v-for="tag in plan.tags" :key="tag" class="plan-tag">#{{ tag }}</span>
            </div>
            <div class="plan-desc">{{ plan.desc }}</div>
            <div class="plan-actions-row">
              <button class="set-current-btn" @click="confirmSetCurrentPlan(plan.id)">设为当前计划</button>
              <button class="delete-plan-btn" @click="confirmDeletePlan(plan.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showUpload" class="upload-modal-mask" @click.self="showUpload = false">
      <div class="upload-modal">
        <div class="upload-header">
          <span>上传我的护肤方案</span>
          <button class="close-btn" @click="showUpload = false">×</button>
        </div>
        <div class="upload-form">
          <input v-model="uploadForm.name" class="upload-input" maxlength="30" placeholder="请输入方案标题" />
          <div class="upload-tags">
            <span v-for="tag in tags.slice(1)" :key="tag" :class="['tag', {active: uploadForm.tags.includes(tag)}]" @click="toggleUploadTag(tag)">{{ tag }}</span>
          </div>
          <textarea v-model="uploadForm.creatorNote" class="upload-textarea" maxlength="100" placeholder="请输入方案注释（可选）"></textarea>
        </div>
        <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>
        <button class="upload-submit" :disabled="uploadLoading" @click="submitUpload">
          {{ uploadLoading ? '上传中...' : '确认上传' }}
        </button>
      </div>
    </div>
    <BottomNavigation />
    <div v-if="showDeleteConfirm" class="delete-confirm-mask">
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-title">确定要删除该方案吗？</div>
        <div class="delete-confirm-actions">
          <button class="delete-confirm-btn danger" @click="doDeletePlan">删除</button>
          <button class="delete-confirm-btn" @click="showDeleteConfirm=false">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 拉入方案确认对话框 -->
    <div v-if="showAddConfirm" class="delete-confirm-mask">
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-title">确定要拉入该方案吗？</div>
        <div class="delete-confirm-content">
          <p>拉入后该方案将保存到我的方案中，可以随时查看和使用。</p>
        </div>
        <div class="delete-confirm-actions">
          <button class="delete-confirm-btn danger" @click="confirmAddPlan">确定拉入</button>
          <button class="delete-confirm-btn" @click="cancelAddPlan">取消</button>
        </div>
      </div>
    </div>
    
    <!-- 设为当前计划确认对话框 -->
    <div v-if="showSetCurrentConfirm" class="delete-confirm-mask">
      <div class="delete-confirm-dialog">
        <div class="delete-confirm-title">确定要设为当前计划吗？</div>
        <div class="delete-confirm-content">
          <p>设为当前计划后，21天打卡计划将重置，所有任务将重新开始。</p>
        </div>
        <div class="delete-confirm-actions">
          <button class="delete-confirm-btn danger" @click="confirmSetCurrentPlanAction">确定设为当前计划</button>
          <button class="delete-confirm-btn" @click="cancelSetCurrentPlan">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import { fetchSquarePlans, uploadSquarePlan, getAllPlans, createCustomPlan, deletePlan } from '@/api/planApi'
import authService from '@/services/authService'
export default {
  name: 'SkincareSquare',
  components: { BottomNavigation },
  data() {
    return {
      tags: ['全部', '补水', '美白', '抗老', '控油', '修护', '祛痘'],
      selectedTag: '全部',
      plans: [],
      myFavorites: [],
      myPlans: [], // 新增
      showMyPlans: false,
      showDetail: false,
      detailPlan: {},
      showUpload: false,
      uploadForm: {
        name: '',
        tags: [],
        creatorNote: ''
      },
      uploadLoading: false,
      uploadError: '',
      uploadSuccess: false,
      showDeleteConfirm: false, // 删除弹窗
      deletePlanId: null, // 待删除id
      showAddConfirm: false, // 新增：拉入方案确认弹窗
      pendingPlan: null, // 新增：待拉入的方案
      showSetCurrentConfirm: false, // 新增：设为当前计划确认弹窗
      pendingSetCurrentPlanId: null, // 新增：待设为当前计划的ID
    }
  },
  async mounted() {
    await this.loadSquarePlans();
    await this.loadMyPlans(); // 页面加载时自动获取我的方案，保证数量判断准确
  },
  computed: {
    filteredPlans() {
      if (this.selectedTag === '全部') return this.plans;
      return this.plans.filter(plan => {
        const tags = Array.isArray(plan.tags) ? plan.tags : [];
        return tags.includes(this.selectedTag);
      });
    }
  },
  methods: {
    async loadSquarePlans() {
      try {
        const { plans } = await fetchSquarePlans(1, 20);
        // 适配字段
        this.plans = plans.map(p => ({
          id: p._id,
          title: p.name,
          tags: Array.isArray(p.tags) ? p.tags : [],
          desc: p.creatorNote || p.notes || '',
          raw: p // 保留原始数据
        }));
      } catch (e) {
        this.plans = [];
      }
    },
    selectTag(tag) {
      this.selectedTag = tag;
    },
    toggleFavorite(planId) {
      if (this.isFavorited(planId)) return;
      if (this.myFavorites.length >= 10) return;
      this.myFavorites.push(planId);
    },
    isFavorited(planId) {
      return this.myFavorites.includes(planId);
    },
    getPlanById(planId) {
      return this.plans.find(p => p.id === planId) || {};
    },
    showPlanDetail(plan) {
      this.detailPlan = plan;
      this.showDetail = true;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
    openUpload() {
      this.uploadForm = { name: '', tags: [], creatorNote: '' };
      this.uploadError = '';
      this.uploadSuccess = false;
      this.loadMyPlans(); // 确保 myPlans 已加载
      this.showUpload = true;
    },
    toggleUploadTag(tag) {
      const index = this.uploadForm.tags.indexOf(tag);
      if (index > -1) {
        this.uploadForm.tags.splice(index, 1);
      } else {
        this.uploadForm.tags.push(tag);
      }
    },
    async submitUpload() {
      this.uploadError = '';
      this.uploadSuccess = false;
      if (!this.uploadForm.name.trim()) {
        this.uploadError = '请填写方案标题'; return;
      }
      if (!this.uploadForm.tags.length) {
        this.uploadError = '请选择至少一个标签'; return;
      }
      this.uploadLoading = true;
      try {
        // 使用21天计划的数据
        const planData = {
              name: this.uploadForm.name,
              tags: this.uploadForm.tags,
              creatorNote: this.uploadForm.creatorNote,
          userAge: 25, // 默认值
          userGender: 'female', // 默认值
          morning: this.planStatus.morningRoutine || [],
          evening: this.planStatus.eveningRoutine || [],
          recommendations: this.planStatus.recommendations || [],
          requirement: '',
          skinConcerns: [],
          customRequirements: '',
          skinAnalysisId: null,
          menstrualCycleInfo: null,
          skinAnalysisSummary: '',
          notes: '',
          days: this.planStatus.days || []
        };
        const token = authService.getToken();
        await uploadSquarePlan(planData, token);
        this.uploadSuccess = true;
        this.showUpload = false;
        this.loadSquarePlans();
      } catch (e) {
        this.uploadError = e.response?.data?.message || '上传失败，请重试';
      }
      this.uploadLoading = false;
    },
    openMyPlans() {
      this.showMyPlans = true;
      this.loadMyPlans();
    },
    async loadMyPlans() {
      try {
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        this.myPlans = plans.map(p => ({
          id: p._id,
          title: p.name,
          tags: Array.isArray(p.tags) ? p.tags : [],
          desc: p.creatorNote || p.notes || '',
          raw: p
        }));
      } catch (e) {
        this.myPlans = [];
      }
    },
    async setCurrentPlan(planId) {
      try {
        // 先获取当前要设为当前计划的plan
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        const plan = plans.find(p => p._id === planId);
        if (plan) {
          // 重置所有任务的完成状态
          if (Array.isArray(plan.morning)) {
            plan.morning.forEach(item => {
              if ('completed' in item) item.completed = false;
              if ('done' in item) item.done = false;
            });
          }
          if (Array.isArray(plan.evening)) {
            plan.evening.forEach(item => {
              if ('completed' in item) item.completed = false;
              if ('done' in item) item.done = false;
            });
          }
          // 保存重置后的plan
          await createCustomPlan({ ...plan, _id: planId });
        }
        // 直接重置21天计划（不需要传递计划ID）
        await this.resetCheckinPlan();
        // 然后设为当前计划
        localStorage.setItem('currentPlanId', planId);
        this.$toast && this.$toast.success('已设为当前计划并重置21天计划');
      } catch (e) {
        this.$toast && this.$toast.error('设置失败：' + (e.message || '未知错误'));
      }
    },
    async handleAddToMyPlans(plan) {
      if (this.myPlans.length >= 10) {
        this.$toast && this.$toast.error('可添加方案已达到上限');
        return;
      }
      if (this.isAlreadyAdded(plan)) {
        this.$toast && this.$toast.error('该方案已拉入');
        return;
      }
      
      try {
      // 组装 planData，字段适配，严格按接口.md要求
      const raw = plan.raw || {};
      const planData = {
        name: plan.title || raw.name || '',
        requirement: raw.requirement || '',
        skinConcerns: raw.skinConcerns || [],
        customRequirements: raw.customRequirements || '',
        userAge: raw.userAge || 20,
        userGender: raw.userGender || 'female',
        skinAnalysisId: raw.skinAnalysisId || null,
        menstrualCycleInfo: raw.menstrualCycleInfo || null,
        morning: raw.morning || [],
        evening: raw.evening || [],
        recommendations: raw.recommendations || [],
        skinAnalysisSummary: raw.skinAnalysisSummary || '',
        creatorNote: plan.desc || raw.creatorNote || '',
        notes: raw.notes || '',
        tags: plan.tags || raw.tags || [],
        days: raw.days || [],
        origin: raw._id || plan.id // 记录原始方案id，防止重复拉入
      };
        
        // 先创建新方案
        await createCustomPlan(planData);
        
        // 获取新创建的计划ID
        const res = await getAllPlans();
        const plans = res.data?.plans || [];
        const newPlan = plans.find(p => p.name === planData.name && p.origin === planData.origin);
        
        if (newPlan) {
          // 拉入我的方案时不重置21天计划
          this.$toast && this.$toast.success('方案已拉入');
        } else {
          this.$toast && this.$toast.success('方案已拉入');
        }
        
        this.loadMyPlans();
      } catch (e) {
        this.$toast && this.$toast.error(e.response?.data?.message || '添加失败');
      }
    },
    isAlreadyAdded(plan) {
      const rawId = plan.raw?._id || plan.id;
      return this.myPlans.some(p => p.raw && (p.raw.origin === rawId));
    },
    confirmAddToMyPlans(plan) {
      if (this.myPlans.length >= 10) {
        this.$toast && this.$toast.error('可添加方案已达到上限');
        return;
      }
      if (this.isAlreadyAdded(plan)) {
        this.$toast && this.$toast.error('该方案已拉入');
        return;
      }

      this.pendingPlan = plan;
      this.showAddConfirm = true;
    },
    
    async confirmAddPlan() {
      if (!this.pendingPlan) return;
      
      try {
        await this.handleAddToMyPlans(this.pendingPlan);
        this.showAddConfirm = false;
        this.pendingPlan = null;
      } catch (e) {
        this.$toast && this.$toast.error(e.response?.data?.message || '添加失败');
      }
    },
    
    cancelAddPlan() {
      this.showAddConfirm = false;
      this.pendingPlan = null;
    },
    async confirmDeletePlan(planId) {
      this.deletePlanId = planId;
      this.showDeleteConfirm = true;
    },
    async doDeletePlan() {
      try {
        await deletePlan(this.deletePlanId);
        this.$toast && this.$toast.success('删除成功');
        this.showDeleteConfirm = false;
        this.deletePlanId = null;
        this.loadMyPlans();
      } catch (e) {
        this.$toast && this.$toast.error(e.response?.data?.message || '删除失败');
      }
    },
    
    // 重置21天打卡计划
    async resetCheckinPlan() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('请先登录');
        }

        console.log('🚀 开始重置21天打卡计划...');

        const response = await fetch('http://localhost:5000/api/checkin-plans/reset', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 收到服务器响应，状态码:', response.status);

        const result = await response.json();
        console.log('📄 响应数据:', result);

        if (result.success) {
          console.log('✅ 21天计划重置成功:', result.data);
          return result.data;
        } else {
          throw new Error(result.message || '重置失败');
        }
      } catch (error) {
        console.error('❌ 重置21天计划失败:', error);
        throw error;
      }
    },
    confirmSetCurrentPlan(planId) {
      this.pendingSetCurrentPlanId = planId;
      this.showSetCurrentConfirm = true;
    },
    
    async confirmSetCurrentPlanAction() {
      if (!this.pendingSetCurrentPlanId) return;
      
      try {
        await this.setCurrentPlan(this.pendingSetCurrentPlanId);
        this.showSetCurrentConfirm = false;
        this.pendingSetCurrentPlanId = null;
        this.$toast && this.$toast.success('已设为当前计划并重置21天计划');
      } catch (e) {
        this.$toast && this.$toast.error('设置失败：' + (e.message || '未知错误'));
      }
    },
    
    cancelSetCurrentPlan() {
      this.showSetCurrentConfirm = false;
      this.pendingSetCurrentPlanId = null;
    }
  }
}
</script>

<style scoped>
.skincare-square-view {
  padding: 0 0 1.5rem 0;
  padding-bottom: 5.5rem;
  background: #fff9fb;
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
}
.square-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84px;
  width: 100vw;
  margin-bottom: 0;
  background: linear-gradient(135deg, #f8bbd0, #e1bee7);
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  position: relative;
  z-index: 2;
}
.header-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  flex: 1;
  text-align: center;
  margin: 0;
  letter-spacing: 1px;
  line-height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon {
  margin-right: 0.5rem;
  font-size: 1.25rem;
  color: #fff;
}
.upload-btn {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.4rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  position: absolute;
  right: 2.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tag-bar {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
  flex-wrap: wrap;
  padding-top: 0.7rem;
}
.tag {
  background: #ffe4ec;
  color: #e75480;
  border-radius: 999px;
  padding: 0.3rem 1.1rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}
.tag.active {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
}
.my-plans-btn {
  margin-left: auto;
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.3rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.my-plans-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.my-plans-modal {
  background: #fff;
  border-radius: 18px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  overflow-y: auto;
}
.my-plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e75480;
  cursor: pointer;
}
.my-plans-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.my-plan-item {
  background: #fff9fb;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  box-shadow: 0 1px 4px #fbbf2433;
}
.empty-tip {
  color: #aaa;
  text-align: center;
  padding: 1.5rem 0;
}
.plan-list {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.plan-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #fbbf2433;
  padding: 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.plan-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e75480;
}
.plan-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}
.plan-tag {
  background: #ffe4ec;
  color: #e75480;
  border-radius: 999px;
  padding: 0.1rem 0.7rem;
  font-size: 0.85rem;
}
.plan-desc {
  color: #666;
  font-size: 0.98rem;
  margin-bottom: 0.3rem;
}
.fav-btn {
  align-self: flex-end;
  background: #e75480;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.3rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.fav-btn:disabled {
  background: #eee;
  color: #aaa;
  cursor: not-allowed;
}
.fav-tip {
  color: #e75480;
  text-align: center;
  margin-top: 1.2rem;
  font-size: 1rem;
}
.plan-detail-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.plan-detail-modal {
  background: #fff;
  border-radius: 18px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  overflow-y: auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.detail-title {
  color: #e75480;
  font-size: 1.2rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e75480;
  cursor: pointer;
}
.detail-tags {
  margin-bottom: 0.5rem;
}
.detail-desc {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.7rem;
}
.detail-meta {
  color: #aaa;
  font-size: 0.92rem;
  margin-bottom: 0.7rem;
}
.detail-steps {
  margin-top: 1rem;
}
.step-section {
  margin-bottom: 0.7rem;
}
.step-title {
  font-weight: 600;
  color: #e75480;
  margin-bottom: 0.3rem;
}
.step-section ul {
  border-left: 2px solid #fbbf24;
  margin-bottom: 0.5rem;
  padding-left: 1.2rem;
}
.step-section li {
  margin-bottom: 0.3rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px dashed #f3d1e3;
  list-style: none;
}
.step-section li:last-child {
  border-bottom: none;
}
.step-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #e75480;
  margin-bottom: 0.3rem;
  margin-top: 0.7rem;
  letter-spacing: 1px;
}
.step-product {
  font-weight: 600;
  color: #e75480;
  margin-right: 0.5rem;
}
.step-reason {
  color: #666;
  font-size: 0.97rem;
}
.upload-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-modal {
  background: #fff;
  border-radius: 18px;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  overflow-y: auto;
}
.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.upload-input {
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  outline: none;
}
.upload-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.upload-tags .tag {
  cursor: pointer;
  user-select: none;
}
.upload-tags .tag.active {
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
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
.upload-error {
  color: #e75480;
  margin-bottom: 0.5rem;
  text-align: center;
}
.upload-submit {
  width: 100%;
  padding: 0.7rem;
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background 0.2s;
}
.upload-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.plan-actions-row {
  display: flex;
  flex-direction: row;
  gap: 0.7rem;
  margin-top: 0.5rem;
}
.set-current-btn {
  flex: 1;
  background: linear-gradient(90deg, #fbbf24, #f18a8a);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.set-current-btn:hover {
  background: linear-gradient(90deg, #f18a8a, #fbbf24);
}
.delete-plan-btn {
  flex: 1;
  background: #e75480;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-plan-btn:hover {
  background: #b91c1c;
}
.delete-confirm-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-confirm-dialog {
  background: #fff;
  border-radius: 1.2rem;
  padding: 2rem 1.5rem 1.2rem 1.5rem;
  box-shadow: 0 8px 32px #0002;
  text-align: center;
  min-width: 220px;
  max-width: 90vw;
}
.delete-confirm-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #e75480;
  margin-bottom: 1.2rem;
}
.delete-confirm-content {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}
.delete-confirm-actions {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
}
.delete-confirm-btn {
  background: #eee;
  color: #e75480;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 2rem;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-confirm-btn.danger {
  background: #e75480;
  color: #fff;
}
.delete-confirm-btn:hover {
  background: #fbbf24;
  color: #fff;
}
</style> 