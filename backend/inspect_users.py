import sqlite3

def inspect_users():
    conn = sqlite3.connect('edweb.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, role FROM users')
    users = cursor.fetchall()
    print("--- User Inspection ---")
    for u in users:
        print(f"ID: {u[0]}, Name: {repr(u[1])}, Email: {repr(u[2])}, Role: {repr(u[3])}")
    conn.close()

if __name__ == "__main__":
    inspect_users()
