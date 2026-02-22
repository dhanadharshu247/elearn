import sqlite3
import models
from database import engine

def check_schema():
    print("--- Database Schema Check ---")
    conn = sqlite3.connect("edweb.db")
    cursor = conn.cursor()
    
    # Get all tables from the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    db_tables = [row[0] for row in cursor.fetchall()]
    print(f"Tables in DB: {db_tables}")
    
    # Get models from SQLAlchemy
    # models.Base.metadata.tables contains the expected schema
    for table_name, table_obj in models.Base.metadata.tables.items():
        if table_name not in db_tables:
            print(f"[MISSING TABLE] {table_name}")
            continue
            
        # Check columns
        cursor.execute(f"PRAGMA table_info({table_name})")
        db_columns = [row[1] for row in cursor.fetchall()]
        
        expected_columns = table_obj.columns.keys()
        missing_columns = [col for col in expected_columns if col not in db_columns]
        
        if missing_columns:
            print(f"[MISSING COLUMNS] Table '{table_name}': {missing_columns}")
        else:
            print(f"[OK] Table '{table_name}'")
            
    conn.close()

if __name__ == "__main__":
    check_schema()
