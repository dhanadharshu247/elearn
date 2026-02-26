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
    learner_creds = {"username": "learner@demo.com", "password": "password123"}
    log(f"Login as {learner_creds['username']}...")
    login_resp = requests.post(f"{BASE_URL}/auth/login", json=learner_creds)
    if login_resp.status_code != 200:
        log("Login failed. Trying to register...")
        reg_data = {"name": "Test Learner", "email": "learner@demo.com", "password": "password123", "role": "learner"}
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

    # 3. Test Retake Logic
    log("\n--- Testing Retake Logic ---")
    
    # Check if already completed
    quiz_info_resp = requests.get(f"{BASE_URL}/quizzes/{course_id}", headers=headers)
    quiz_info = quiz_info_resp.json()
    
    if quiz_info.get("completed"):
        log(f"Quiz already completed once. Percentage: {quiz_info.get('percentage')}%")
        # If passed, it should be blocked already
        if quiz_info.get("percentage") >= 50:
            log("User already passed. Testing if additional submission is blocked...")
            submit_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                                        json={"answers": [0]*20, "is_adaptive": False, "question_ids": []}, 
                                        headers=headers)
            log(f"Submit attempt result: {submit_resp.status_code} - {submit_resp.text}")
            if submit_resp.status_code == 400:
                log("SUCCESS: retake blocked for passing learner.")
            else:
                log("FAILURE: retake should have been blocked for passing learner.")
        else:
            log("User failed previously. This might be the first or second attempt.")
    
    # Submit a failure
    log("Submitting a failure (0 score)...")
    # We need to know how many questions there are
    questions = quiz_info.get("questions", [])
    if not questions:
        # If completed, we get review questions
        questions = quiz_info.get("review", [])
    
    num_qs = len(questions)
    if num_qs == 0:
        log("No questions found in course to submit.")
    else:
        # Submit all wrong (assuming 0 is not always correct, or just use -1 for MCQ if allowed)
        # The backend expects indices or text
        fail_answers = [99] * num_qs # Invalid index to ensure failure
        submit_fail_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                                          json={"answers": fail_answers, "is_adaptive": False, "question_ids": [q["id"] for q in questions]}, 
                                          headers=headers)
        log(f"Failing submission status: {submit_fail_resp.status_code} - {submit_fail_resp.text}")
        
        # Now try to get questions again
        log("Trying to get questions after failure...")
        after_fail_resp = requests.get(f"{BASE_URL}/quizzes/{course_id}", headers=headers)
        after_fail_data = after_fail_resp.json()
        
        if after_fail_data.get("completed"):
            # If it says completed, then retake was NOT allowed or we reached the limit
            log("Quiz shows as completed. Checking if this was the second failure...")
            # We can't easily check 'count' without DB access but we can try another submission
            log("Trying a THIRD submission (which should be blocked)...")
            third_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/submit", 
                                         json={"answers": fail_answers, "is_adaptive": False, "question_ids": [q["id"] for q in questions]}, 
                                         headers=headers)
            log(f"Third submission status: {third_resp.status_code} - {third_resp.text}")
            if third_resp.status_code == 400:
                log("SUCCESS: 3rd attempt blocked correctly.")
            else:
                log("FAILURE: 3rd attempt should have been blocked.")
        else:
            log("SUCCESS: Questions returned after failure. Retake is allowed.")

    # 4. Verify Question source (Adaptive)
    log("\n--- Testing Adaptive Question Source ---")
    # Start adaptive quiz
    start_resp = requests.post(f"{BASE_URL}/quizzes/{course_id}/adaptive/start", headers=headers)
    log(f"Start adaptive quiz status: {start_resp.status_code}")
    if start_resp.status_code == 200:
        data = start_resp.json()
        if data.get("question"):
            log(f"First adaptive question: {data['question']['questionText']}")
    else:
        log(f"Adaptive start failed: {start_resp.text}")

    log("\nVerification complete. Check verif_assessment_result.log for details.")

if __name__ == "__main__":
    run_verification()
