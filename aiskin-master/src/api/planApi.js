import axios from 'axios'
import authService from '@/services/authService'
import apiConfig from './config'

const API_URL = apiConfig.API_URL

// 获取授权头
const getAuthHeader = () => {
  const token = authService.getToken()
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

/**
 * Create a new plan
 * @param {Object} planData - Plan data including userId, age, skinConcerns, customRequirements
 * @returns {Promise} - API response
 */
export const createPlan = async (planData) => {
  console.group('🎯 创建个性化护肤方案');
  console.log('📡 API请求: 创建方案');
  console.log('🔗 请求URL:', `${API_URL}/plans`);
  console.log('📊 请求数据:', planData);

  try {
    const response = await axios.post(
      `${API_URL}/plans`,
      planData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ 方案创建成功');
    console.log('📋 方案详情:', {
      方案ID: response.data.data?.plan?._id,
      用户年龄: response.data.data?.plan?.userAge,
      护肤需求: response.data.data?.plan?.skinConcerns,
      早晨步骤: response.data.data?.plan?.morning?.length || 0,
      晚间步骤: response.data.data?.plan?.evening?.length || 0
    });
    console.log('📋 完整响应数据:', response.data);
    console.groupEnd();

    return response.data;
  } catch (error) {
    console.error('❌ 创建方案失败');
    console.error('🚨 错误详情:', {
      状态码: error.response?.status,
      错误信息: error.response?.data?.message || error.message,
      请求数据: planData
    });
    console.groupEnd();
    throw error;
  }
}

/**
 * 获取所有护肤方案
 * @returns {Promise} - API 响应
 */
export const getAllPlans = () => {
  console.log('🔍 护肤方案请求: 获取所有方案')
  return axios.get(`${API_URL}/plans`, getAuthHeader())
    .then(response => {
      console.log('✅ 护肤方案响应: 获取成功', response.data)
      return response.data
    })
    .catch(error => {
      console.error('❌ 护肤方案错误:', error.response ? error.response.data : error.message)
      throw error
    })
}

/**
 * 获取单个护肤方案详情
 * @param {String} planId - 护肤方案ID
 * @returns {Promise} - API 响应
 */
export const getPlan = (planId) => {
  console.log('🔍 护肤方案请求: 获取方案详情', { planId })
  return axios.get(`${API_URL}/plans/${planId}`, getAuthHeader())
    .then(response => {
      console.log('✅ 护肤方案响应: 获取成功', response.data)
      return response.data
    })
    .catch(error => {
      console.error('❌ 护肤方案错误:', error.response ? error.response.data : error.message)
      throw error
    })
}

/**
 * 删除护肤方案
 * @param {String} planId - 护肤方案ID
 * @returns {Promise} - API 响应
 */
export const deletePlan = (planId) => {
  console.log('🔍 护肤方案请求: 删除方案', { planId })
  return axios.delete(`${API_URL}/plans/${planId}`, getAuthHeader())
    .then(response => {
      console.log('✅ 护肤方案响应: 删除成功', response.data)
      return response.data
    })
    .catch(error => {
      console.error('❌ 护肤方案错误:', error.response ? error.response.data : error.message)
      throw error
    })
}

/**
 * 创建21天打卡计划
 * @param {string} token - 用户JWT
 * @param {string} planName - 计划名称
 * @param {string} startDate - 开始日期(YYYY-MM-DD)
 * @returns {Promise}
 */
export const createCheckinPlan = async (token, planName, startDate) => {
  return axios.post(
    `${API_URL}/checkin-plans`,
    { planName, startDate },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

/**
 * 获取所有21天打卡计划
 * @param {string} token - 用户JWT
 * @returns {Promise}
 */
export const getAllCheckinPlans = async (token) => {
  return axios.get(`${API_URL}/checkin-plans`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data.data.plans);
}

/**
 * 获取单个21天打卡计划详情
 * @param {string} token - 用户JWT
 * @param {string} planId - 计划ID
 * @returns {Promise}
 */
export const getCheckinPlanById = async (token, planId) => {
  return axios.get(`${API_URL}/checkin-plans/${planId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data.data.plan);
}

/**
 * 21天护肤计划打卡
 * @param {string} token - 用户JWT
 * @param {string} planId - 计划ID
 * @param {string} dateStr - 打卡日期(YYYY-MM-DD)
 * @returns {Promise}
 */
export const checkinTodayFor21Plan = async (token, planId, dateStr) => {
  const res = await axios.patch(
    `${API_URL}/checkin-plans/${planId}/checkin`,
    { date: dateStr },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

/**
 * 获取护肤广场方案列表
 * @param {number} page - 页码，默认1
 * @param {number} limit - 每页条数，默认10
 * @returns {Promise<{plans, total, currentPage, pageSize}>}
 */
export const fetchSquarePlans = async (page = 1, limit = 10) => {
  const res = await axios.get(`${API_URL}/square`, {
    params: { page, limit }
  });
  if (res.data.success) {
    return {
      plans: res.data.data,
      total: res.data.total,
      currentPage: res.data.page,
      pageSize: res.data.limit
    };
  } else {
    throw new Error('获取护肤广场数据失败');
  }
}

/**
 * 上传护肤广场方案
 * @param {Object} planData - 方案数据，需包含name、tags、注释等
 * @param {string} token - 用户token
 * @returns {Promise}
 */
export const uploadSquarePlan = async (planData, token) => {
  return axios.post(
    `${API_URL}/square`,
    planData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * 直接写入plan数据集（不调用AI）
 * @param {Object} planData - Plan数据，字段需与planModel一致
 * @returns {Promise} - API响应
 */
export const createCustomPlan = async (planData) => {
  return axios.post(
    `${API_URL}/plans/custom`,
    planData,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

export default {
  createPlan,
  getAllPlans,
  getPlan,
  deletePlan,
  createCheckinPlan,
  getAllCheckinPlans,
  getCheckinPlanById,
  checkinTodayFor21Plan,
  fetchSquarePlans,
  uploadSquarePlan,
  createCustomPlan
} 