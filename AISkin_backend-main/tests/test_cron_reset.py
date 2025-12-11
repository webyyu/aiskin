import requests
import time
from datetime import datetime

# 1. 登录获取token
LOGIN_URL = "http://localhost:5000/api/users/login"
login_data = {
    "phone": "17707759358",   # <<< 替换为你的手机号
    "password": "123456"   # <<< 替换为你的密码
}
login_resp = requests.post(LOGIN_URL, json=login_data)
if login_resp.status_code != 200 or not login_resp.json().get('token'):
    print("登录失败!", login_resp.status_code, login_resp.text)
    exit(1)
token = login_resp.json()['token']
print("登录成功，token:", token)

# 2. 获取当前护肤方案
BASE_URL = "http://localhost:5000/api/plans"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 获取所有方案
plans_resp = requests.get(BASE_URL, headers=headers)
if plans_resp.status_code != 200:
    print("获取护肤方案失败!", plans_resp.status_code, plans_resp.text)
    exit(1)

plans = plans_resp.json()['data']['plans']
if not plans:
    print("没有找到护肤方案，请先生成一个")
    exit(1)

plan = plans[0]  # 取第一个方案
plan_id = plan['_id']
print(f"测试方案ID: {plan_id}")

# 3. 先设置一些步骤为已完成
print("\n=== 设置步骤为已完成 ===")
test_payload = {
    "period": "morning",
    "step": 1,
    "completed": True
}

update_resp = requests.patch(f"{BASE_URL}/{plan_id}/step", json=test_payload, headers=headers)
if update_resp.status_code == 200:
    print("✅ 成功设置morning step 1为已完成")
else:
    print("❌ 设置失败:", update_resp.status_code, update_resp.text)

# 4. 检查当前状态
print("\n=== 检查当前完成状态 ===")
current_plan = requests.get(f"{BASE_URL}/{plan_id}", headers=headers).json()['data']['plan']
morning_completed = [step['completed'] for step in current_plan['morning']]
evening_completed = [step['completed'] for step in current_plan['evening']]
print(f"Morning完成状态: {morning_completed}")
print(f"Evening完成状态: {evening_completed}")

# 5. 等待定时任务执行（这里只是演示，实际需要等到0点）
print("\n=== 定时任务测试说明 ===")
print("当前时间:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("定时任务会在每天0点自动重置所有步骤的完成状态为False")
print("你可以：")
print("1. 等到0点看是否自动重置")
print("2. 或者手动修改server.js中的cron时间，比如改为每分钟执行一次进行测试")
print("3. 或者手动调用重置接口（如果有的话）")

# 6. 模拟手动重置（可选）
print("\n=== 模拟手动重置（可选） ===")
print("如果你想立即测试重置效果，可以手动修改数据库或添加重置接口")
print("当前morning step 1的状态:", current_plan['morning'][0]['completed']) 