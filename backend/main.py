import models, database, auth, schemas, random
from datetime import timedelta, datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, shutil
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel  # Import BaseModel
import rag  # Import the RAG engine

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

# --- RAG Integration ---
@app.on_event("startup")
def startup_event():
    # Index content on startup
    db = database.SessionLocal()
    try:
        courses = db.query(models.Course).filter(models.Course.status == "Published").all()
        # Transform to list of dicts for RAG
        courses_data = []
        for c in courses:
            c_dict = {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "modules": [{"id": m.id, "title": m.title, "contentLink": m.contentLink} for m in c.modules]
            }
            courses_data.append(c_dict)
        
        # Build Index
        rag.index_content(courses_data)
        print("RAG Index built successfully.")
    except Exception as e:
        print(f"Failed to build RAG index: {e}")
    finally:
        db.close()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_query = request.message
    
    # 1. Retrieve Context
    context_chunks = rag.retrieve(user_query)
    
    # 2. Generate Response
    response_text = rag.generate_response(user_query, context_chunks)
    
    return {"response": response_text}


# Global Exception Handler
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        with open("backend_errors_global.log", "a") as f:
            f.write(f"\nUnhandled Error: {request.method} {request.url}\n")
            f.write(traceback.format_exc())
            print(traceback.format_exc()) # Print to console too
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(e)}
        )


# Ensure upload directory exists
UPLOAD_DIR = "uploads/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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
def get_all_courses(q: Optional[str] = None, db: Session = Depends(database.get_db)):
    # Only return published courses for the general explore feed
    query = db.query(models.Course).filter(models.Course.status == "Published")
    
    if q:
        query = query.filter(
            or_(
                models.Course.title.ilike(f"%{q}%"),
                models.Course.description.ilike(f"%{q}%")
            )
        )
    
    courses = query.all()
    
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
def get_my_courses(
    status: Optional[str] = None, 
    q: Optional[str] = None,
    current_user: dict = Depends(auth.get_current_user), 
    db: Session = Depends(database.get_db)
):
    user_id = current_user["id"]
    if current_user["role"] == "instructor":
        query = db.query(models.Course).filter(models.Course.instructor_id == user_id)
    else:
        # Get courses the user is enrolled in
        enrolments = db.query(models.Enrolment).filter(models.Enrolment.user_id == user_id).all()
        course_ids = [e.course_id for e in enrolments]
        
        # Learners should ONLY see 'Published' courses in their learning list
        query = db.query(models.Course).filter(
            models.Course.id.in_(course_ids),
            models.Course.status == "Published"
        )
    
    if status and status != 'All':
        query = query.filter(models.Course.status == status)
    
    if q:
        query = query.filter(
            or_(
                models.Course.title.ilike(f"%{q}%"),
                models.Course.description.ilike(f"%{q}%")
            )
        )

    courses = query.all()
    
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
    
    # Notify all learners about the new course
    learners = db.query(models.User).filter(models.User.role == "learner").all()
    for learner in learners:
        notif = models.Notification(
            user_id=learner.id,
            title="New Course Available",
            message=f"A new course '{new_course.title}' has been published. Check it out!",
            type="course_launch",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)

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

    # If status is Published, notify all learners
    if course.status == "Published":
        learners = db.query(models.User).filter(models.User.role == "learner").all()
        for learner in learners:
            notification = models.Notification(
                user_id=learner.id,
                title="New Course Launched!",
                message=f"Instructor {current_user['name']} has launched a new course: {course.title}",
                type="course_launch"
            )
            db.add(notification)
        db.commit()

    return {"message": "Status updated", "status": course.status}

@app.put("/courses/{course_id}", response_model=dict)
def update_course(course_id: int, course_update: schemas.CourseUpdate, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can update courses")
    
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if db_course.instructor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update Course Metadata
    db_course.title = course_update.title
    db_course.description = course_update.description
    db_course.thumbnail = course_update.thumbnail
    db_course.price = course_update.price
    db_course.status = course_update.status
    
    # Handle Modules
    incoming_module_ids = [m.id for m in course_update.modules if m.id is not None]
    
    # Delete modules not in update
    db.query(models.Module).filter(
        models.Module.course_id == course_id,
        ~models.Module.id.in_(incoming_module_ids)
    ).delete(synchronize_session=False)
    
    for mod_data in course_update.modules:
        if mod_data.id:
            db_module = db.query(models.Module).filter(models.Module.id == mod_data.id).first()
            if db_module:
                db_module.title = mod_data.title
                db_module.contentLink = mod_data.contentLink
        else:
            db_module = models.Module(
                title=mod_data.title,
                contentLink=mod_data.contentLink,
                course_id=course_id
            )
            db.add(db_module)
            db.flush()
            
        # Handle Quiz for this module
        incoming_q_ids = [q.id for q in mod_data.quiz if q.id is not None]
        db.query(models.Question).filter(
            models.Question.module_id == db_module.id,
            ~models.Question.id.in_(incoming_q_ids)
        ).delete(synchronize_session=False)
        
        for q_data in mod_data.quiz:
            if q_data.id:
                db_q = db.query(models.Question).filter(models.Question.id == q_data.id).first()
                if db_q:
                    db_q.questionText = q_data.questionText
                    db_q.correctOptionIndex = q_data.correctOptionIndex
            else:
                db_q = models.Question(
                    questionText=q_data.questionText,
                    correctOptionIndex=q_data.correctOptionIndex,
                    module_id=db_module.id
                )
                db.add(db_q)
                db.flush()
            
            # Recreate options for simplicity
            db.query(models.QuestionOption).filter(models.QuestionOption.question_id == db_q.id).delete()
            for opt_data in q_data.options:
                db.add(models.QuestionOption(text=opt_data.text, question_id=db_q.id))

    db.commit()
    return {"message": "Course updated successfully"}

@app.delete("/courses/{course_id}")
def delete_course(course_id: int, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can delete courses")
        
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if db_course.instructor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Deletion is handled by cascades in models.py
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

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
            
            student_data = student_map[student.id]
            student_data["courses"].append(course.title)
            student_data["progress_total"] += course_progress
            student_data["course_count"] += 1
            if course_progress == 100 and "Legend" not in student_data["badges"]:
                student_data["badges"].append("Legend")

        # Finalize progress (average)
        result = []
        for s_id, data in student_map.items():
            progress_total = data.get("progress_total", 0)
            course_count = data.get("course_count", 0)
            data["progress"] = int(progress_total / course_count) if course_count > 0 else 0
            if not data["badges"]:
                data["badges"] = ["Newbie"]
            # Remove intermediate fields
            data.pop("progress_total", None)
            data.pop("course_count", None)
            result.append(data)
        
        return result
    except Exception as e:
        print("ERROR in get_my_learners:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/courses/{course_id}")
def get_course(course_id: int, current_user_opt: Optional[dict] = Depends(auth.get_current_user_optional), db: Session = Depends(database.get_db)):
    try:
        course = db.query(models.Course).filter(models.Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Security: If not published and user is not the instructor, deny access
        if course.status != "Published":
            is_instructor = current_user_opt and current_user_opt.get("role") == "instructor" and course.instructor_id == current_user_opt.get("id")
            if not is_instructor:
                raise HTTPException(status_code=403, detail="This course is currently not available (Draft/Archived)")
        
        # Batch Timing Check for Learners
        if current_user_opt and current_user_opt.get("role") == "learner":
            user_id = current_user_opt.get("id")
            # Find if user is in any batch for this specific course
            batch = db.query(models.Batch).join(models.Batch.students).filter(
                models.Batch.course_id == course_id,
                models.User.id == user_id
            ).first()
            
            if batch and (batch.start_time or batch.end_time):
                now = datetime.utcnow()
                if batch.start_time and now < batch.start_time:
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Your batch access starts at {batch.start_time.strftime('%Y-%m-%d %H:%M:%S')} UTC"
                    )
                if batch.end_time and now > batch.end_time:
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Your batch access ended at {batch.end_time.strftime('%Y-%m-%d %H:%M:%S')} UTC"
                    )
        
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
                "id": course.instructor.id if course.instructor else None,
                "name": course.instructor.name if course.instructor else "Unknown",
                "email": course.instructor.email if course.instructor else ""
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
    except Exception as e:
        import traceback
        with open("backend_errors.log", "a") as f:
            f.write(f"\nError in get_course({course_id}):\n")
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

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

    # Check for course completion and award badge
    course = module.course
    total_modules = len(course.modules)
    completed_modules = db.query(models.QuizResult.module_id).filter(
        models.QuizResult.user_id == current_user["id"],
        models.QuizResult.module_id.in_([m.id for m in course.modules])
    ).distinct().count()

    if completed_modules == total_modules:
        # Create or fetch a badge for this course
        badge_name = f"{course.title} Graduate"
        badge = db.query(models.Badge).filter(models.Badge.name == badge_name).first()
        if not badge:
            badge = models.Badge(
                name=badge_name,
                description=f"Completed all modules in {course.title}",
                icon="Award"
            )
            db.add(badge)
            db.commit()
            db.refresh(badge)
        
        # Award badge to user if they don't have it
        user = db.query(models.User).filter(models.User.id == current_user["id"]).first()
        if badge not in user.badges:
            user.badges.append(badge)
            db.commit()
            
            # Send notification
            notification = models.Notification(
                user_id=user.id,
                title="Badge Earned!",
                message=f"Congratulations! You've earned the '{badge_name}' badge.",
                type="success"
            )
            db.add(notification)
            db.commit()

        # --- Batch Assignment Logic ---
        # Calculate average score
        quiz_results = db.query(models.QuizResult).filter(
            models.QuizResult.user_id == current_user["id"],
            models.QuizResult.module_id.in_([m.id for m in course.modules])
        ).all()
        
        total_score_percentage = 0
        count = 0
        for qr in quiz_results:
            if qr.total_questions > 0:
                total_score_percentage += (qr.score / qr.total_questions) * 100
                count += 1
        
        avg_score = total_score_percentage / count if count > 0 else 0
        
        # Determine Batch Name
        batch_name = "Bronze"
        if avg_score >= 90:
            batch_name = "Diamond"
        elif avg_score >= 80:
            batch_name = "Gold"
        elif avg_score >= 70:
            batch_name = "Silver"
        
        # Get or Create Batch
        # We need to find a batch for this course with this name.
        # Ideally, batches are unique by (course_id, name).
        batch = db.query(models.Batch).filter(
            models.Batch.course_id == course.id,
            models.Batch.name == batch_name
        ).first()
        
        if not batch:
            batch = models.Batch(
                name=batch_name,
                course_id=course.id,
                instructor_id=course.instructor_id
            )
            db.add(batch)
            db.commit()
            db.refresh(batch)
        
        # Assign User to Batch
        # We need to fetch the user object again to be sure attached to session if needed, 
        # but we already have 'user' from above.
        if user not in batch.students:
            batch.students.append(user)
            db.commit()
            
            # Notify User about Batch
            batch_notif = models.Notification(
                user_id=user.id,
                title="Batch Assigned!",
                message=f"You've been assigned to the '{batch_name}' batch based on your performance ({int(avg_score)}%).",
                type="info"
            )
            db.add(batch_notif)
            db.commit()

    return new_result

# --- New Feature Endpoints ---

# Notifications
@app.get("/notifications", response_model=List[schemas.Notification])
def get_notifications(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user["id"]).order_by(models.Notification.created_at.desc()).all()

@app.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user["id"]
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}

# Messaging
@app.post("/messages", response_model=schemas.Message)
def send_message(msg: schemas.MessageCreate, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_msg = models.Message(
        sender_id=current_user["id"],
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@app.get("/messages", response_model=List[schemas.Message])
def get_my_messages(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.Message).filter(
        or_(
            models.Message.sender_id == current_user["id"],
            models.Message.receiver_id == current_user["id"]
        )
    ).order_by(models.Message.created_at.desc()).all()

# Batches
@app.post("/batches", response_model=schemas.Batch)
def create_batch(batch: schemas.BatchCreate, current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create batches")
    
    new_batch = models.Batch(
        name=batch.name,
        course_id=batch.course_id,
        instructor_id=current_user["id"],
        start_time=batch.start_time,
        end_time=batch.end_time
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch

@app.post("/batches/{batch_id}/students")
def assign_students_to_batch(batch_id: int, student_ids: List[int], current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can assign students to batches")
    
    batch = db.query(models.Batch).filter(models.Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.instructor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to manage this batch")
    
    # Clear existing students and re-assign? Or add new ones? 
    # Usually manual assignment replaces or adds. Let's do a set-based replacement for simplicity if the list is provided.
    students = db.query(models.User).filter(models.User.id.in_(student_ids), models.User.role == "learner").all()
    
    # Check if students are enrolled in the course
    enrolled_student_ids = [e.user_id for e in batch.course.enrolments]
    valid_students = [s for s in students if s.id in enrolled_student_ids]
    
    if len(valid_students) != len(student_ids):
        # Some students are not enrolled or don't exist
        print(f"Warning: Some student IDs were skipped for assignment to batch {batch_id}")

    batch.students = valid_students
    db.commit()

    # Create notifications for assigned students
    for student in valid_students:
        notif = models.Notification(
            user_id=student.id,
            title="Batch Assigned",
            message=f"You have been assigned to the '{batch.name}' batch for course '{batch.course.title}'.",
            type="info"
        )
        db.add(notif)
    
    db.commit()
    return {"message": f"Successfully assigned {len(valid_students)} students to batch."}

@app.get("/batches", response_model=List[schemas.Batch])
def get_batches(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if current_user["role"] == "instructor":
        batches = db.query(models.Batch).filter(models.Batch.instructor_id == current_user["id"]).all()
    else:
        # Learners can see batches they are in
        batches = db.query(models.Batch).join(models.Batch.students).filter(models.User.id == current_user["id"]).all()
    
    # Manually populate course_title if needed, though SQLAlchemy relationship might handle it if schema is right
    # To be explicit and avoid lazy loading issues in response model:
    for b in batches:
        b.course_title = b.course.title if b.course else "Unknown Course"
    
    return batches

# Badges
@app.get("/users/me/badges", response_model=List[schemas.Badge])
def get_my_badges(current_user: dict = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == current_user["id"]).first()
    return user.badges

@app.get("/badges/all", response_model=List[schemas.Badge])
def get_all_badges(db: Session = Depends(database.get_db)):
    return db.query(models.Badge).all()


if __name__ == "__main__":
    import uvicorn
    print("Starting SQLAlchemy-based server on http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
