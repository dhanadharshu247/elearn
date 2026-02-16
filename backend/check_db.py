import models, database
from sqlalchemy.orm import Session

def check():
    db = next(database.get_db())
    users = db.query(models.User).all()
    courses = db.query(models.Course).all()
    enrolments = db.query(models.Enrolment).all()
    
    print(f"Users: {len(users)}")
    for u in users:
        print(f" - {u.email} ({u.role})")
        
    print(f"Courses: {len(courses)}")
    for c in courses:
        print(f" - {c.title} (Instructor: {c.instructor.email if c.instructor else 'None'})")
        print(f"   Modules: {len(c.modules)}")
        for m in c.modules:
            print(f"     - {m.title} (id: {m.id}, Quiz Qs: {len(m.quiz)})")
            
    print(f"Enrolments: {len(enrolments)}")
    
    results = db.query(models.QuizResult).all()
    print(f"Quiz Results: {len(results)}")
    for r in results:
        print(f" - User {r.user_id}, Module {r.module_id}, Score {r.score}")

if __name__ == "__main__":
    check()
