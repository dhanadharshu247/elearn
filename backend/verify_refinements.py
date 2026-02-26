import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(msg)

def run_verification():
    # 1. Login as instructor
    log("Login as instructor...")
    inst_creds = {"username": "v_inst@demo.com", "password": "password123"}
    login_resp = requests.post(f"{BASE_URL}/auth/login", json=inst_creds)
    if login_resp.status_code != 200:
        log("Instructor login failed.")
        return
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a course with 3 assessment questions
    log("Creating a course with 3 assessment questions...")
    course_data = {
        "title": f"Refinement Course {int(time.time())}",
        "description": "Testing dynamic question count",
        "price": 0,
        "status": "Published",
        "assessment": [
            {
                "questionText": "Test Q1 (Easy)",
                "questionType": "mcq",
                "difficulty": "easy",
                "options": [{"text": "A"}, {"text": "B"}],
                "correctOptionIndex": 0
            },
            {
                "questionText": "Test Q2 (Medium)",
                "questionType": "mcq",
                "difficulty": "medium",
                "options": [{"text": "A"}, {"text": "B"}],
                "correctOptionIndex": 0
            },
            {
                "questionText": "Test Q3 (Hard)",
                "questionType": "mcq",
                "difficulty": "hard",
                "options": [{"text": "A"}, {"text": "B"}],
                "correctOptionIndex": 0
            }
        ]
    }
    c_resp = requests.post(f"{BASE_URL}/courses", json=course_data, headers=headers)
    if c_resp.status_code != 200:
        log(f"Course creation failed: {c_resp.text}")
        return
    
    course_id = c_resp.json()["id"]
    log(f"Course {course_id} created successfully.")

    # 3. Enroll and test adaptive start response
    log(f"Enrolling in course {course_id}...")
    requests.post(f"{BASE_URL}/courses/{course_id}/enroll", headers=headers)
    
    log(f"Testing adaptive start for course {course_id}...")
    start_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/adaptive/start", headers=headers)
    if start_resp.status_code == 200:
        data = start_resp.json()
        total_qs = data.get("totalQuestions")
        log(f"Received totalQuestions: {total_qs}")
        if total_qs == 3:
            log("SUCCESS: Backend correctly returns totalQuestions count (3).")
        else:
            log(f"FAILURE: Expected 3 questions, got {total_qs}")
    else:
        log(f"Adaptive start failed: {start_resp.text}")

    # 4. Check Unique Student Logic (Visual/Mock check)
    log("\nNote: Unique student counting in dashboard is implemented in JSX.")
    log("Check InstructorDashboard.jsx for the Set logic in stats calculation.")

if __name__ == "__main__":
    run_verification()
