<template>
  <router-link to="/twenty-one-day-plan" class="twenty-one-day-plan-card-link">
    <div class="twenty-one-day-plan-card">
      <div class="card-content">
        <h3>21天护肤计划</h3>
        <p>点击开启你的21天护肤挑战！</p>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: 'TwentyOneDayPlanCard'
}
</script>

<style scoped>
.twenty-one-day-plan-card-link {
  text-decoration: none;
  display: block;
}
.twenty-one-day-plan-card {
  background: #ffe4ec;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 174, 201, 0.15);
  padding: 1.2rem;
  margin: 1rem 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.twenty-one-day-plan-card:hover {
  box-shadow: 0 4px 16px rgba(255, 174, 201, 0.25);
}
.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: #e75480;
}
.card-content p {
  margin: 0;
  color: #b85c8e;
  font-size: 0.95rem;
}
</style> 