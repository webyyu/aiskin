import requests

# 1. 登录获取token
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

# 2. 上传图片并分析
analyze_url = 'http://localhost:5000/api/skin-analysis/analyze'
headers = {
    'Authorization': f'Bearer {token}'
}
files = {
    'faceImage': open('faceImage-1750863866153-916594783.jpg', 'rb')
}
analyze_resp = requests.post(analyze_url, headers=headers, files=files)
print('【分析响应】', analyze_resp.status_code, analyze_resp.text)
try:
    analyze_json = analyze_resp.json()
    print('【分析结果】', analyze_json)
except Exception as e:
    print('返回内容不是JSON:', e)