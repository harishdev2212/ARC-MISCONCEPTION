import sqlite3

conn = sqlite3.connect(r'C:\Users\SAM\.gemini\antigravity-ide\conversations\ea603aa0-7233-4045-8cfc-68b534f7d72b.db')
cur = conn.cursor()
cur.execute("SELECT idx, step_type, length(step_payload) FROM steps WHERE step_payload LIKE '%Update ONLY the MindTrace AI authentication/login page%'")
rows = cur.fetchall()
print("Matching user prompt steps:", rows)
if rows:
    user_idx = rows[0][0]
    cur.execute("SELECT step_payload FROM steps WHERE idx = ?", (user_idx,))
    payload = cur.fetchone()[0]
    with open('scratch/actual_user_message.txt', 'w', encoding='utf-8') as f:
        f.write(payload.decode('utf-8', errors='ignore'))
    print("Wrote actual user message from step", user_idx)

with open('scratch/user_prompt_raw.txt', 'w', encoding='utf-8') as f:
    for idx, step_type, payload in rows:
        f.write(f"\n=== IDX={idx} STEP_TYPE={step_type} ===\n")
        f.write(payload.decode('utf-8', errors='ignore'))
print("Done writing raw user prompt")
