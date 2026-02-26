import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def log(msg):
    print(msg)
    with open("verif_assessment_result.log", "a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")

def run_verification():
    with open("verif_assessment_result.log", "w", encoding="utf-8") as f:
        f.write("--- Assessment Logic Verification ---\n")

    # 1. Setup Test Data (Login as learner)
    learner_creds = {"username": f"test_learner_{int(time.time())}@demo.com", "password": "password123"}
    log(f"Registering/Login as {learner_creds['username']}...")
    reg_data = {"name": "Test Learner", "email": learner_creds['username'], "password": "password123", "role": "learner"}
    requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    login_resp = requests.post(f"{BASE_URL}/auth/login", json=learner_creds)
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Find a course to test with
    log("Fetching courses...")
    courses_resp = requests.get(f"{BASE_URL}/courses", headers=headers)
    courses = courses_resp.json()
    if not courses:
        log("No courses found. Please create a course first.")
        return
    
    course_id = courses[0]["id"]
    log(f"Testing with course: {courses[0]['title']} (ID: {course_id})")

    # Enroll in course
    requests.post(f"{BASE_URL}/courses/{course_id}/enroll", headers=headers)

    # 3. Test Retake Logic & Badge
    log("\n--- Testing Retake Logic & Badge ---")
    
    # Get questions
    quiz_info_resp = requests.get(f"{BASE_URL}/quizzes/{course_id}", headers=headers)
    quiz_info = quiz_info_resp.json()
    questions = quiz_info.get("questions", [])
    num_qs = len(questions)
    
    if num_qs == 0:
        log("No questions found in course.")
        return

    # Attempt 1: FAILURE
    log("Attempt 1: Submitting failure...")
    fail_answers = [99] * num_qs
    resp1 = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                          json={"answers": fail_answers, "is_adaptive": False, "question_ids": [q["id"] for q in questions]}, 
                          headers=headers)
    res1 = resp1.json()
    log(f"Attempt 1 result: {res1.get('score')}/{res1.get('totalQuestions')} ({res1.get('percentage')}%), badgeAwarded: {res1.get('badgeAwarded')}")
    
    if res1.get('badgeAwarded') == False:
        log("SUCCESS: No badge awarded for failure.")
    else:
        log("FAILURE: Badge awarded for failure!")

    # Verify retake allowed
    log("Verifying retake is allowed after 1st failure...")
    retake_resp = requests.get(f"{BASE_URL}/quizzes/{course_id}", headers=headers)
    retake_data = retake_resp.json()
    if not retake_data.get("completed"):
        log("SUCCESS: Retake allowed.")
    else:
        log("FAILURE: Retake NOT allowed after 1st failure.")

    # Attempt 2: FAILURE
    log("Attempt 2: Submitting 2nd failure...")
    resp2 = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                          json={"answers": fail_answers, "is_adaptive": False, "question_ids": [q["id"] for q in questions]}, 
                          headers=headers)
    log(f"Attempt 2 status: {resp2.status_code}")
    
    # Attempt 3: Should be BLOCKED
    log("Attempt 3: SHOULD BE BLOCKED...")
    resp3 = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                          json={"answers": fail_answers, "is_adaptive": False, "question_ids": [q["id"] for q in questions]}, 
                          headers=headers)
    log(f"Attempt 3 result: {resp3.status_code} - {resp3.text}")
    if resp3.status_code == 400:
        log("SUCCESS: 3rd attempt blocked correctly.")
    else:
        log("FAILURE: 3rd attempt was NOT blocked.")

    # 4. Verify Adaptive Question Source
    log("\n--- Testing Adaptive Question Source ---")
    # Note: We need a new user because attempt limit reached for this course
    log("Creating new user for adaptive test...")
    user2_creds = {"username": f"adaptive_tester_{int(time.time())}@demo.com", "password": "password123"}
    requests.post(f"{BASE_URL}/auth/register", json={"name": "Adaptive Tester", "email": user2_creds['username'], "password": "password123", "role": "learner"})
    u2_token = requests.post(f"{BASE_URL}/auth/login", json=user2_creds).json()["access_token"]
    u2_headers = {"Authorization": f"Bearer {u2_token}"}
    requests.post(f"{BASE_URL}/courses/{course_id}/enroll", headers=u2_headers)

    log("Starting adaptive quiz...")
    start_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/adaptive/start", headers=u2_headers)
    if start_resp.status_code == 200:
        data = start_resp.json()
        if data.get("question"):
            log(f"SUCCESS: Instructor question shown: {data['question']['questionText']}")
    else:
        log(f"FAILURE: Adaptive start failed: {start_resp.text}")

    log("\nVerification complete.")

if __name__ == "__main__":
    run_verification()
