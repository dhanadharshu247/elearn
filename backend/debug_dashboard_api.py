import requests

BASE_URL = "http://127.0.0.1:8000"

def debug_dashboard():
    # Login as instructor
    login_data = {"username": "instructor@demo.com", "password": "password123"}
    print(f"Logging in as {login_data['username']}...")
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} - {res.text}")
            return
        
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test /batches
        print("\nTesting GET /batches...")
        res = requests.get(f"{BASE_URL}/batches", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.text}")
        else:
            print(f"Fetched {len(res.json())} batches")

        # Test /courses/my-courses (instructor view)
        print("\nTesting GET /courses/my-courses...")
        res = requests.get(f"{BASE_URL}/courses/my-courses", headers=headers)
        print(f"Status: {res.status_code}")
        if res.status_code != 200:
            print(f"Error: {res.text}")
        else:
            print(f"Fetched {len(res.json())} my-courses (as instructor)")


    except Exception as e:
        print(f"Exception during debug: {e}")

if __name__ == "__main__":
    debug_dashboard()
