from sqlalchemy.orm import Session
import models, database, auth
from datetime import datetime

def seed():
    db = next(database.get_db())
    
    # 1. Create Instructor
    instructor_email = "instructor@edweb.com"
    instructor = db.query(models.User).filter(models.User.email == instructor_email).first()
    
    if not instructor:
        instructor = models.User(
            name="Dr. Jane Smith",
            email=instructor_email,
            password=auth.get_password_hash("password123"),
            role="instructor"
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)
        print(f"Created instructor: {instructor_email}")
    else:
        print("Instructor already exists.")

    # 2. Create Sample Courses
    if db.query(models.Course).count() == 0:
        courses_data = [
            {
                "title": "Introduction to FastAPI",
                "description": "Learn the basics of building high-performance APIs with Python.",
                "price": 49.99,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
                "modules": [
                    {
                        "title": "Getting Started",
                        "contentLink": "https://www.youtube.com/watch?v=7t2alSnE2-I",
                        "quiz": [
                            {
                                "questionText": "What does FastAPI use for data validation?",
                                "correctOptionIndex": 0,
                                "options": ["Pydantic", "SQLAlchemy", "Django", "Flask"]
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Advanced React Patterns",
                "description": "Master compound components, render props, and hooks for scalable UI.",
                "price": 79.99,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
                "modules": []
            },
            {
                "title": "Data Science with Python",
                "description": "A comprehensive guide to data analysis and machine learning.",
                "price": 0.0,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1551288049-bbda48658a7e?auto=format&fit=crop&w=800&q=80",
                "modules": []
            }
        ]
        
        for c_data in courses_data:
            course = models.Course(
                title=c_data["title"],
                description=c_data["description"],
                price=c_data["price"],
                status=c_data["status"],
                thumbnail=c_data["thumbnail"],
                instructor_id=instructor.id
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            
            for m_data in c_data.get("modules", []):
                module = models.Module(
                    title=m_data["title"],
                    contentLink=m_data["contentLink"],
                    course_id=course.id
                )
                db.add(module)
                db.commit()
                db.refresh(module)
                
                for q_data in m_data.get("quiz", []):
                    question = models.Question(
                        questionText=q_data["questionText"],
                        correctOptionIndex=q_data["correctOptionIndex"],
                        module_id=module.id
                    )
                    db.add(question)
                    db.commit()
                    db.refresh(question)
                    
                    for opt_text in q_data.get("options", []):
                        option = models.QuestionOption(
                            text=opt_text,
                            question_id=question.id
                        )
                        db.add(option)
        
        db.commit()
        print(f"Added {len(courses_data)} sample courses.")
    else:
        print("Courses already exist.")

if __name__ == "__main__":
    seed()
