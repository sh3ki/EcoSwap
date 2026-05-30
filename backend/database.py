import sqlite3
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = "ecoswap.db"
_lock = threading.Lock()


def init_db() -> None:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                started_at       TEXT    NOT NULL,
                ended_at         TEXT,
                bottles          INTEGER DEFAULT 0,
                cans             INTEGER DEFAULT 0,
                rejected         INTEGER DEFAULT 0,
                coins_dispensed  INTEGER DEFAULT 0,
                leftover_bottles INTEGER DEFAULT 0,
                leftover_cans    INTEGER DEFAULT 0
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS detections (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id  INTEGER NOT NULL,
                detected_at TEXT    NOT NULL,
                result      TEXT    NOT NULL,
                confidence  REAL    DEFAULT 0,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)
        conn.commit()
        conn.close()


def start_session() -> int:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("INSERT INTO sessions (started_at) VALUES (?)",
                  (datetime.now().isoformat(),))
        session_id = c.lastrowid
        conn.commit()
        conn.close()
    return session_id  # type: ignore[return-value]


def end_session(session_id: int, bottles: int, cans: int, rejected: int,
                coins: int, leftover_b: int, leftover_c: int) -> None:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            UPDATE sessions
               SET ended_at=?, bottles=?, cans=?, rejected=?,
                   coins_dispensed=?, leftover_bottles=?, leftover_cans=?
             WHERE id=?
        """, (datetime.now().isoformat(), bottles, cans, rejected,
              coins, leftover_b, leftover_c, session_id))
        conn.commit()
        conn.close()


def log_detection(session_id: int, result: str, confidence: float) -> None:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute(
            "INSERT INTO detections (session_id, detected_at, result, confidence) VALUES (?, ?, ?, ?)",
            (session_id, datetime.now().isoformat(), result, confidence),
        )
        conn.commit()
        conn.close()


def get_overall_stats() -> Dict[str, int]:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            SELECT
                COUNT(*)                      AS total_sessions,
                COALESCE(SUM(bottles),  0)    AS total_bottles,
                COALESCE(SUM(cans),     0)    AS total_cans,
                COALESCE(SUM(rejected), 0)    AS total_rejected,
                COALESCE(SUM(coins_dispensed), 0) AS total_coins
            FROM sessions
            WHERE ended_at IS NOT NULL
        """)
        row = c.fetchone()
        conn.close()
    return {
        "total_sessions": row[0],
        "total_bottles":  row[1],
        "total_cans":     row[2],
        "total_rejected": row[3],
        "total_coins":    row[4],
    }


def get_sessions(limit: int = 50) -> List[Dict[str, Any]]:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute(
            "SELECT * FROM sessions ORDER BY id DESC LIMIT ?", (limit,)
        )
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
    return rows
