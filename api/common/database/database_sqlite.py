"""database_sqlite.py

Representative class for SQLite database operations

20241012 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from api.common.config import logger
from api.common.types import sbs_fact, sbs_session
import json
import sqlite3


class SbsSqlite:
    def __init__(self, db_file_name: str):
        logger.info(f"SbsSqlite.__init__ for {db_file_name}")

        self.db_file_name = db_file_name
        self.conn = None
        self.cursor = None

    def enter(self):
        self.conn = sqlite3.connect(self.db_file_name)
        self.cursor = self.conn.cursor()

    def exit(self):
        self.conn.commit()
        self.conn.close()

    @classmethod
    def truncate_values(cls, obj, max_length=100):
        truncated_obj = {}
        for key, value in obj.items():
            if isinstance(value, str):
                original_length = len(value)
                if original_length > max_length:
                    truncated_obj[key] = (
                        f"{value[:max_length]}... (original length: {original_length})"
                    )
                else:
                    truncated_obj[key] = value
            else:
                truncated_obj[key] = value
        return truncated_obj

    def db_create(self):
        self.enter()
        self.cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS sbs_session (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL
        )
        """
        )
        self.cursor.execute(
            """
        CREATE TABLE IF NOT EXISTS sbs_fact (
            id INTEGER PRIMARY KEY,
            session_id INTEGER NOT NULL,
            main_clause TEXT NOT NULL,
            subclause_id TEXT NULL,
            subclause TEXT NULL,
            content TEXT NOT NULL,
            score_completeness INTEGER NULL,
            explanation_completeness TEXT NULL,
            draft_id TEXT NOT NULL,
            content_id TEXT NOT NULL,
            document_text_reference TEXT NULL,
            draft TEXT NULL,
            score INTEGER NULL
        )
        """
        )
        self.exit()

    from typing import Tuple

    def db_populate_sbs_session(self, row: sbs_session):
        self.enter()
        self.cursor.execute(
            """
            SELECT id FROM sbs_session
            WHERE path = ?
            """,
            (row.path,),
        )

        inserted_id: int = 0
        is_new: bool = False
        rows = self.cursor.fetchall()

        # Get column names from the cursor description
        column_names = [description[0] for description in self.cursor.description]

        # Convert rows to a list of dictionaries
        data = [dict(zip(column_names, row)) for row in rows]

        if len(data) > 0:
            logger.info(f"Session already exists: {data}")

            inserted_id = data[0]["id"] or 0
        else:
            logger.info(f"Creating new session for {row.path}")
            # Insert data
            self.cursor.execute(
                """
            INSERT INTO sbs_session (
                path)
            VALUES (?)
            """,
                (row.path,),
            )

            inserted_id = self.cursor.lastrowid or 0
            is_new = True

        self.exit()

        return inserted_id, is_new

    def db_populate_sbs_fact(self, row: sbs_fact) -> int:
        self.enter()
        # Insert data
        self.cursor.execute(
            """
        INSERT INTO sbs_fact (
            session_id, main_clause, subclause_id, subclause, content, score_completeness,
            explanation_completeness, draft_id, content_id, document_text_reference, draft)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                row.session_id,
                row.main_clause,
                row.subclause_id,
                row.subclause,
                row.content,
                row.score_completeness,
                row.explanation_completeness,
                row.draft_id,
                row.content_id,
                row.document_text_reference,
                row.draft,
            ),
        )

        inserted_id = self.cursor.lastrowid

        self.exit()

        return inserted_id

    # Query the database
    def db_get_sbs_fact_list(self, session_id: int):
        self.enter()
        # Query data
        self.cursor.execute(
            """
            SELECT B.path, A.* FROM sbs_fact A left join sbs_session B on A.session_id = B.id
            WHERE B.id = ?
            """,
            (session_id,),
        )
        rows = self.cursor.fetchall()

        # Get column names from the cursor description
        column_names = [description[0] for description in self.cursor.description]

        # Convert rows to a list of dictionaries
        data = [dict(zip(column_names, row)) for row in rows]

        # Convert the list of dictionaries to a JSON string
        # json_data = json.dumps(data, indent=4)

        # Print the data
        for index, row in enumerate(data, start=1):
            if index % 250 == 0:
                truncated_obj = SbsSqlite.truncate_values(row)

                logger.info(f"Row {index}: {json.dumps(truncated_obj, indent=4)}")

        self.exit()

        return data
