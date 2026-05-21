import urllib.request
import urllib.parse
import json
import sys

def main():
    # Reconfigure sys.stdout to utf-8 on Windows to avoid UnicodeEncodeError in PowerShell
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    print("--- CORE SUPPORT PLANNING ALGORITHM TEST ---")

    # 1. Login as lead
    print("\n1. Logging in as test@test.ru...")
    login_data = urllib.parse.urlencode({'username': 'test@test.ru', 'password': 'password'}).encode()
    req = urllib.request.Request('http://localhost:8000/api/v1/auth/login', data=login_data)
    try:
        res = urllib.request.urlopen(req)
        token = json.loads(res.read())['access_token']
        print("Successfully logged in! Token acquired.")
    except Exception as e:
        print(f"Login failed: {e}")
        sys.exit(1)

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # 2. Run planning with max_tasks_per_worker = 2
    print("\n2. Running planning algorithm with max_tasks_per_worker = 2...")
    planning_data = json.dumps({
        'max_tasks_per_worker': 2,
        'assign_to_inactive': True
    }).encode()
    
    req_plan = urllib.request.Request('http://localhost:8000/api/v1/planning/run', data=planning_data, headers=headers)
    try:
        res_plan = urllib.request.urlopen(req_plan)
        plan_result = json.loads(res_plan.read().decode('utf-8'))
        print("\n[PLANNING RESULT]")
        print(json.dumps(plan_result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Planning failed: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

    # 3. Create a new task with auto_assign=True
    print("\n3. Creating a new high-priority task with auto_assign=True...")
    new_task_data = json.dumps({
        'title': 'Срочная задача поддержки',
        'content': 'Починить продакшн базу данных',
        'priority': 'high'
    }).encode()
    
    req_create = urllib.request.Request('http://localhost:8000/api/v1/tasks/?auto_assign=true', data=new_task_data, headers=headers)
    try:
        res_create = urllib.request.urlopen(req_create)
        created_task = json.loads(res_create.read().decode('utf-8'))
        print("\n[CREATED TASK RESULT]")
        print(json.dumps(created_task, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Task creation failed: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

    print("\n--- TEST COMPLETED SUCCESSFULLY ---")

if __name__ == '__main__':
    main()
