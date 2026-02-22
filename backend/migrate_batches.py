import sqlite3
import os

def migrate():
    db_path = "edweb.db" 
    if not os.path.exists(db_path):
        # Check if it's in a subfolder or different name
        print(f"Database {db_path} not found in current directory.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Checking for missing columns in 'batches' table...")
    try:
        cursor.execute("PRAGMA table_info(batches)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "start_time" not in columns:
            print("Adding 'start_time' column to 'batches' table...")
            cursor.execute("ALTER TABLE batches ADD COLUMN start_time DATETIME")
        
        if "end_time" not in columns:
            print("Adding 'end_time' column to 'batches' table...")
            cursor.execute("ALTER TABLE batches ADD COLUMN end_time DATETIME")
            
        conn.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
