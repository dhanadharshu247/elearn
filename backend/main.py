import models, database, auth, schemas, random
from datetime import timedelta, datetime
from typing import List, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="EdWeb API (SQLAlchemy)")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "EdWeb API (SQLAlchemy) is running"}

@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.username).first()
    
    if not user or not auth.verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={
            "sub": user.email, 
            "role": user.role,
            "id": user.id
        }, 
        expires_delta=access_token_expires
    )
    
    # We return the user object as well for the frontend
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.role,
        "user": user
    }

@app.post("/auth/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # For security, don't reveal if user doesn't exist, but frontend logic here says 
        # "If an account exists with this email, you will receive a reset link."
        # However, it returns success: true.
        return {"message": "If an account exists, an OTP has been sent"}
    
    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    user.reset_otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    # In a real app, send email. Here, we print it to the console.
    print(f"\n[RESET OTP] Email: {user.email}, OTP: {otp}\n")
    
    return {"message": "OTP sent to email"}

@app.post("/auth/verify-otp")
def verify_otp(request: schemas.VerifyOtpRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or user.reset_otp != request.otp or (user.otp_expiry and user.otp_expiry < datetime.utcnow()):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    return {"message": "OTP verified"}

@app.post("/auth/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(database.get_db)):
    # Frontend passes 'token' as the OTP in verifyOtp then 'token' again in resetPassword
    # Looking at AuthContext.jsx: 
    # verifyOtp sends {email, otp}
    # resetPassword sends {token, new_password} where 'token' is likely the OTP or email.
    # In ForgotPasswordPage.jsx, it doesn't even use verifyOtp yet? 
    # Actually, let's assume 'token' in ResetPasswordRequest is the OTP.
    
    user = db.query(models.User).filter(models.User.reset_otp == request.token).first()
    if not user or (user.otp_expiry and user.otp_expiry < datetime.utcnow()):
        raise HTTPException(status_code=400, detail="Invalid token or expired OTP")
    
    user.password = auth.get_password_hash(request.new_password)
    user.reset_otp = None # Clear OTP after use
    user.otp_expiry = None
    db.commit()
    
    return {"message": "Password reset successfully"}

@app.get("/courses", response_model=List[dict])
def get_all_courses(db: Session = Depends(database.get_db)):
    # Only return published courses for the general explore feed
    courses = db.query(models.Course).filter(models.Course.status == "Published").all()
    
    result = []
    for c in courses:
        result.append({
            "id": c.id,
            "_id": c.id,
            "title": c.title,
            "description": c.description,
            "thumbnail": c.thumbnail,
            "price": c.price,
            "status": c.status,
            "instructor_id": c.instructor_id,
            "enrolledStudents": [e.user_id for e in c.enrolments],
            "progress": 0,
            "instructor": {
                "id": c.instructor.id,
                "name": c.instructor.name,
                "email": c.instructor.email
            }
        })
    return result

@app.get("/courses/my-courses", response_model=List[dict])
def get_my_courses(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user_id = current_user["id"]
    if current_user["role"] == "instructor":
        courses = db.query(models.Course).filter(models.Course.instructor_id == user_id).all()
    else:
        # Get courses the user is enrolled in
        enrolments = db.query(models.Enrolment).filter(models.Enrolment.user_id == user_id).all()
        course_ids = [e.course_id for e in enrolments]
        courses = db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()
    
    result = []
    for c in courses:
        progress = 0
        if current_user["role"] == "learner":
            total_modules = len(c.modules)
            if total_modules > 0:
                completed_modules = db.query(models.QuizResult.module_id).filter(
                    models.QuizResult.user_id == user_id,
                    models.QuizResult.module_id.in_([m.id for m in c.modules])
                ).distinct().count()
                progress = int((completed_modules / total_modules) * 100)
                
        result.append({
            "id": c.id,
            "_id": c.id,
            "title": c.title,
            "description": c.description,
            "thumbnail": c.thumbnail,
            "price": c.price,
            "status": c.status,
            "instructor_id": c.instructor_id,
            "enrolledStudents": [e.user_id for e in c.enrolments],
            "progress": progress,
            "instructor": {
                "id": c.instructor.id,
                "name": c.instructor.name,
                "email": c.instructor.email
            }
        })
    return result

@app.post("/courses", response_model=dict)
def create_course(course: schemas.CourseCreate, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create courses")
    
    new_course = models.Course(
        title=course.title,
        description=course.description,
        thumbnail=course.thumbnail,
        price=course.price,
        status=course.status,
        instructor_id=current_user["id"]
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Create modules if provided
    for mod_data in course.modules:
        new_module = models.Module(
            title=mod_data.title,
            contentLink=mod_data.contentLink,
            course_id=new_course.id
        )
        db.add(new_module)
        db.commit()
        db.refresh(new_module)
        
        for q_data in mod_data.quiz:
            new_q = models.Question(
                questionText=q_data.questionText,
                correctOptionIndex=q_data.correctOptionIndex,
                module_id=new_module.id
            )
            db.add(new_q)
            db.commit()
            db.refresh(new_q)
            
            for opt_data in q_data.options:
                new_opt = models.QuestionOption(
                    text=opt_data.text,
                    question_id=new_q.id
                )
                db.add(new_opt)
    
    db.commit()
    return {**schemas.CourseResponse.from_orm(new_course).dict(), "_id": new_course.id}

@app.put("/courses/{course_id}/status")
def update_course_status(course_id: int, status_update: dict, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course.instructor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    course.status = status_update.get("status", "Draft")
    db.commit()
    return {"message": "Status updated", "status": course.status}

import traceback

@app.get("/courses/my-learners", response_model=List[dict])
def get_my_learners(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    try:
        if current_user["role"] != "instructor":
            raise HTTPException(status_code=403, detail="Only instructors can access learner reports")
        
        instructor_id = current_user["id"]
        
        # Courses owned by this instructor
        my_courses = db.query(models.Course).filter(models.Course.instructor_id == instructor_id).all()
        my_course_ids = [c.id for c in my_courses]
        
        # Find all enrollments for these courses
        relevant_enrolments = db.query(models.Enrolment).filter(models.Enrolment.course_id.in_(my_course_ids)).all()
        
        # Group by student and calculate progress
        student_map = {}
        for e in relevant_enrolments:
            student = e.user
            course = e.course
            
            if not student or not course:
                continue
                
            # Get total modules in this course to calculate progress for this specific course/student pair
            total_modules = len(course.modules)
            course_progress = 0
            if total_modules > 0:
                completed_modules = db.query(models.QuizResult.module_id).filter(
                    models.QuizResult.user_id == student.id,
                    models.QuizResult.module_id.in_([m.id for m in course.modules])
                ).distinct().count()
                course_progress = int((completed_modules / total_modules) * 100)

            # Create student entry if it doesn't exist
            if student.id not in student_map:
                student_map[student.id] = {
                    "id": student.id,
                    "name": student.name or "User",
                    "email": student.email,
                    "courses": [],
                    "progress_total": 0,
                    "course_count": 0,
                    "badges": [],
                    "status": "Active",
                    "lastActive": student.created_at.strftime("%Y-%m-%d") if student.created_at else "Recently",
                    "avatar": student.name[0].upper() if (student.name and len(student.name) > 0) else "U"
                }
            
            student_map[student.id]["courses"].append(course.title)
            student_map[student.id]["progress_total"] += course_progress
            student_map[student.id]["course_count"] += 1
            if course_progress == 100 and "Legend" not in student_map[student.id]["badges"]:
                student_map[student.id]["badges"].append("Legend")

        # Finalize progress (average)
        result = []
        for s_id, data in student_map.items():
            data["progress"] = int(data["progress_total"] / data["course_count"]) if data["course_count"] > 0 else 0
            if not data["badges"]:
                data["badges"] = ["Newbie"]
            # Remove intermediate fields
            del data["progress_total"]
            del data["course_count"]
            result.append(data)
        
        return result
    except Exception as e:
        print("ERROR in get_my_learners:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}")
def get_course(course_id: int, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "id": course.id,
        "_id": course.id,
        "title": course.title,
        "description": course.description,
        "thumbnail": course.thumbnail,
        "price": course.price,
        "status": course.status,
        "instructor_id": course.instructor_id,
        "enrolledStudents": [e.user_id for e in course.enrolments],
        "instructor": {
            "id": course.instructor.id,
            "name": course.instructor.name,
            "email": course.instructor.email
        },
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "contentLink": m.contentLink,
                "quiz": [
                    {
                        "id": q.id,
                        "questionText": q.questionText,
                        "correctOptionIndex": q.correctOptionIndex,
                        "options": [{"text": o.text} for o in q.options]
                    } for q in m.quiz
                ]
            } for m in course.modules
        ]
    }

@app.post("/courses/{course_id}/enroll")
def enroll_in_course(course_id: int, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing_enrolment = db.query(models.Enrolment).filter(
        models.Enrolment.user_id == current_user["id"],
        models.Enrolment.course_id == course_id
    ).first()
    
    if existing_enrolment:
        return {"message": "Already enrolled"}
    
    new_enrolment = models.Enrolment(
        user_id=current_user["id"],
        course_id=course_id
    )
    db.add(new_enrolment)
    db.commit()
    
    return {"message": "Enrolled successfully"}

@app.post("/modules/{module_id}/quiz/submit", response_model=schemas.QuizResultResponse)
def submit_quiz_result(module_id: int, result: schemas.QuizResultCreate, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Check if module exists
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if a result already exists to update or just add new
    # For now, let's keep all attempts or just the latest? Let's keep the latest high score or just the latest attempt.
    # Simple: Always save the latest attempt.
    new_result = models.QuizResult(
        user_id=current_user["id"],
        module_id=module_id,
        score=result.score,
        total_questions=result.total_questions
    )
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result

if __name__ == "__main__":
    import uvicorn
    print("Starting SQLAlchemy-based server on http://127.0.0.1:8005")
    uvicorn.run(app, host="127.0.0.1", port=8005)
