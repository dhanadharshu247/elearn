import models
import database
import auth
import os

def seed():
    # Initialize DB if not exists
    db = database.get_db_data()
    
    # Check if instructor exists (Cleaned up)
    print("Demo instructor seeding disabled in seed_data.py")

    # Check if courses exist (Disabled static seeding)
    print("Static course seeding disabled in seed_data.py")

    database.save_db_data(db)

if __name__ == "__main__":
    seed()
