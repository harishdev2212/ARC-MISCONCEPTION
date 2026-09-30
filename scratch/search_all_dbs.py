import os
import sqlite3

conv_dir = r'C:\Users\SAM\.gemini\antigravity-ide\conversations'
for f in os.listdir(conv_dir):
    if f.endswith('.db'):
        db_path = os.path.join(conv_dir, f)
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("SELECT idx FROM steps WHERE step_payload LIKE '%wide_clean%'")
            rows = cur.fetchall()
            if rows:
                print(f"FOUND in {f}: {len(rows)} occurrences -> {rows[:5]}")
        except Exception as e:
            pass
print("Done searching all conversation databases.")
