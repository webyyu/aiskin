import requests
import json

# 1. 登录获取token
def login():
    login_url = 'http://localhost:5000/api/users/login'
    login_data = {
        'phone': '17707759358',
        'password': '123456'
    }
    login_resp = requests.post(login_url, json=login_data)
    print('【登录响应】', login_resp.status_code, login_resp.text)
    login_json = login_resp.json()
    token = login_json.get('token') or (login_json.get('data') or {}).get('token')
    if not token:
        print('登录失败，无法获取token')
        exit(1)
    print('【获取到token】', token)
    return token

# 2. 获取用户的21天打卡计划
def get_checkin_plans(token):
    plans_url = 'http://localhost:5000/api/checkin-plans'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    plans_resp = requests.get(plans_url, headers=headers)
    print('【获取打卡计划响应】', plans_resp.status_code, plans_resp.text)
    plans_json = plans_resp.json()
    if plans_json.get('success'):
        plans = plans_json.get('data', {}).get('plans', [])
        if plans:
            return plans[0]['_id']  # 返回最新的计划ID
        else:
            print('用户没有打卡计划')
            return None
    else:
        print('获取打卡计划失败')
        return None

# 3. 重置21天打卡计划
def reset_checkin_plan(token, plan_id):
    reset_url = f'http://localhost:5000/api/checkin-plans/{plan_id}/reset'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    reset_resp = requests.patch(reset_url, headers=headers)
    print('【重置打卡计划响应】', reset_resp.status_code, reset_resp.text)
    reset_json = reset_resp.json()
    if reset_json.get('success'):
        print('✅ 重置成功！')
        return reset_json.get('data')
    else:
        print('❌ 重置失败:', reset_json.get('message'))
        return None

# 4. 查看重置后的计划详情
def view_plan_details(token, plan_id):
    detail_url = f'http://localhost:5000/api/checkin-plans/{plan_id}'
    headers = {
        'Authorization': f'Bearer {token}'
    }
    detail_resp = requests.get(detail_url, headers=headers)
    print('【查看计划详情响应】', detail_resp.status_code, detail_resp.text)
    detail_json = detail_resp.json()
    if detail_json.get('success'):
        plan = detail_json.get('data', {}).get('plan')
        print('\n📋 重置后的计划详情:')
        print(f'计划名称: {plan.get("name")}')
        print(f'开始日期: {plan.get("startDate")}')
        print(f'创建时间: {plan.get("createdAt")}')
        print(f'更新时间: {plan.get("updatedAt")}')
        print('\n�� 21天打卡状态:')
        for day in plan.get('days', []):
            status = '✅ 已打卡' if day.get('checked') else '❌ 未打卡'
            print(f'第{day.get("dayIndex")}天: {status}')
        return plan
    else:
        print('❌ 获取计划详情失败:', detail_json.get('message'))
        return None

# 主函数
def main():
    print('�� 开始测试重置21天打卡计划功能')
    print('=' * 50)
    
    # 1. 登录
    print('\n1️⃣ 登录获取token...')
    token = login()
    
    # 2. 获取打卡计划
    print('\n2️⃣ 获取用户的打卡计划...')
    plan_id = get_checkin_plans(token)
    if not plan_id:
        print('❌ 没有找到打卡计划，无法测试重置功能')
        return
    
    print(f'📋 找到打卡计划，ID: {plan_id}')
    
    # 3. 重置打卡计划
    print('\n3️⃣ 重置21天打卡计划...')
    reset_result = reset_checkin_plan(token, plan_id)
    if not reset_result:
        print('❌ 重置失败，测试结束')
        return
    
    # 4. 查看重置后的详情
    print('\n4️⃣ 查看重置后的计划详情...')
    view_plan_details(token, plan_id)
    
    print('\n�� 测试完成！')

if __name__ == '__main__':
    main()