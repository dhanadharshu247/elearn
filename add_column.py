import sqlite3
import os

db_path = "./backend/edweb.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE quiz_results ADD COLUMN course_id INTEGER REFERENCES courses(id);")
        conn.commit()
        print("Successfully added course_id column to quiz_results")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column course_id already exists")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()
else:
    print("Database file not found at " + db_path)
