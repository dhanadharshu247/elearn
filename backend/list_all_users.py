import sqlite3

def list_all_users():
    conn = sqlite3.connect('edweb.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, role FROM users')
    users = cursor.fetchall()
    print("--- All Users ---")
    for u in users:
        print(u)
    conn.close()

if __name__ == "__main__":
    list_all_users()
