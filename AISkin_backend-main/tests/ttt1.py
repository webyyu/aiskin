import requests

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

# 2. PATCH接口测试
BASE_URL = "http://localhost:5000/api/plans"
plan_id = "68791bd9a48f194203d78ee5"

payload = {
    "period": "morning",      # "morning" 或 "evening"
    "step": 2,                # 步骤编号
    "completed": False         # 要设置的完成状态
}

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

url = f"{BASE_URL}/{plan_id}/step"

response = requests.patch(url, json=payload, headers=headers)

print("状态码:", response.status_code)
print("响应内容:", response.json())