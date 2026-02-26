import models
import database
from sqlalchemy.orm import Session
import os

def cleanup():
    db = next(database.get_db())
    try:
        # 1. Targeted emails
        demo_emails = ["instructor@edweb.com", "miru@gmail.com", "lesson@demo.com", "learner@demo.com", "instructor@demo.com"]
        
        # 2. Pattern matching (optional but useful)
        # users_to_delete = db.query(models.User).filter(
        #     (models.User.email.in_(demo_emails)) | 
        #     (models.User.email.like("%@demo.com"))
        # ).all()
        
        # For safety, let's just use the exact list and the @demo.com pattern
        db.query(models.User).filter(
            (models.User.email.in_(demo_emails)) | 
            (models.User.email.like("%@demo.com"))
        ).delete(synchronize_session=False)

        # 3. Clean up dangling enrolments (where user no longer exists)
        # SQLAlchemy delete with subquery can be tricky with SQLite, let's just query IDs
        user_ids = [r[0] for r in db.query(models.User.id).all()]
        db.query(models.Enrolment).filter(~models.Enrolment.user_id.in_(user_ids)).delete(synchronize_session=False)
        db.query(models.QuizResult).filter(~models.QuizResult.user_id.in_(user_ids)).delete(synchronize_session=False)
        
        db.commit()
        print("Demo users and dangling records successfully removed from the database.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
