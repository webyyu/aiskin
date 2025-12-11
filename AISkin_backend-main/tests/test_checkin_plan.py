import requests

BASE_URL = 'http://localhost:5000'
REGISTER_URL = f'{BASE_URL}/api/users/register'
LOGIN_URL = f'{BASE_URL}/api/users/login'
CREATE_CHECKIN_PLAN_URL = f'{BASE_URL}/api/checkin-plans'  # 路径已更新

# 测试用户信息
TEST_USER = {
    'name': '测试用户',
    'phone': '19999999999',
    'password': 'test1234',
    'gender': 'female'
}

# 注册用户（如果已存在会报错，可忽略）
def register():
    try:
        resp = requests.post(REGISTER_URL, json=TEST_USER, timeout=5)
        print('注册响应:', resp.json())
    except Exception as e:
        print('注册异常:', e)

# 登录获取token
def login():
    resp = requests.post(LOGIN_URL, json={
        'phone': TEST_USER['phone'],
        'password': TEST_USER['password']
    }, timeout=5)
    data = resp.json()
    print('登录响应:', data)
    return data.get('token')

# 创建21天打卡计划
def create_checkin_plan(token):
    headers = {'Authorization': f'Bearer {token}'}
    payload = {
        'planName': '21天早起打卡',
        'startDate': '2024-06-01'
    }
    resp = requests.post(CREATE_CHECKIN_PLAN_URL, json=payload, headers=headers, timeout=5)
    print('创建打卡计划响应:', resp.json())
    assert resp.status_code == 201
    data = resp.json()
    assert data['success']
    assert data['data']['plan']['name'] == '21天早起打卡'
    assert len(data['data']['plan']['days']) == 21
    for day in data['data']['plan']['days']:
        assert not day['checked']

if __name__ == '__main__':
    register()
    token = login()
    if token:
        create_checkin_plan(token)
    else:
        print('登录失败，无法进行后续测试') 