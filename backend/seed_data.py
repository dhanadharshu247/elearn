import models
import database
import auth
import os

def seed():
    # Initialize DB if not exists
    db = database.get_db_data()
    
    # Check if instructor exists
    instructor = next((u for u in db["users"] if u["email"] == "instructor@edweb.com"), None)
    if not instructor:
        instructor_id = max([u["id"] for u in db["users"]] + [0]) + 1
        instructor = {
            "id": instructor_id,
            "name": "Dr. Jane Smith",
            "email": "instructor@edweb.com",
            "password": auth.get_password_hash("password123"),
            "role": "instructor",
            "created_at": models.UserResponse(name="Dr. Jane Smith", email="instructor@edweb.com", id=instructor_id).created_at
        }
        db["users"].append(instructor)
        print(f"Created instructor: {instructor['email']}")

    # Check if courses exist
    if not db["courses"]:
        courses = [
            {
                "id": 1,
                "title": "Introduction to FastAPI",
                "description": "Learn the basics of building high-performance APIs with Python.",
                "instructor_id": instructor["id"],
                "price": 49.99,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
                "created_at": models.CourseResponse(title="1", description="1", id=1, instructor_id=1).created_at
            },
            {
                "id": 2,
                "title": "Advanced React Patterns",
                "description": "Master compound components, render props, and hooks for scalable UI.",
                "instructor_id": instructor["id"],
                "price": 79.99,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
                "created_at": models.CourseResponse(title="2", description="2", id=2, instructor_id=1).created_at
            },
            {
                "id": 3,
                "title": "Data Science with Python",
                "description": "A comprehensive guide to data analysis and machine learning.",
                "instructor_id": instructor["id"],
                "price": 0.0,
                "status": "Published",
                "thumbnail": "https://images.unsplash.com/photo-1551288049-bbda48658a7e?auto=format&fit=crop&w=800&q=80",
                "created_at": models.CourseResponse(title="3", description="3", id=3, instructor_id=1).created_at
            }
        ]
        db["courses"].extend(courses)
        print(f"Added {len(courses)} sample courses.")
    else:
        print("Courses already exist in database.")

    database.save_db_data(db)

if __name__ == "__main__":
    seed()
