"""database_sqlite.py

Representative class for SQLite database operations

20241012 Cyrus Kasra -- v-cyruskasra@microsoft.com -- Initial release

Returns:
    _type_: None
"""

from api.common.config import logger
from api.common.types import (
    CommonQueryParamsPagination,
    SbsFactReviewRequest,
    SbsSessionUpdateRequest,
    sbs_fact,
    sbs_session,
)
import json
import sqlite3
from typing import List


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

    @classmethod
    def print_truncated_values(cls, data):
        # Print the data
        for index, row in enumerate(data, start=0):
            if index % 250 == 0:
                truncated_obj = SbsSqlite.truncate_values(row)

                logger.info(f"Row {index + 1}: {json.dumps(truncated_obj, indent=4)}")

    @classmethod
    def fetch_row_count(cls, cursor, sql_from_expr) -> int:
        # Query to get the total record count
        cursor.execute(
            f"""
            SELECT COUNT(*) FROM {sql_from_expr}
            """
        )

        return cursor.fetchone()[0]

    @classmethod
    def fetch_data(
        cls,
        cursor,
        sql_epxr,
        pagination: CommonQueryParamsPagination = None,
        columns_to_jsonify: List[str] = [],
        columns_to_truncate: List[str] = [],
        data_size_limit: int = 100,
    ):
        pagination_to_use = (
            ""
            if pagination is None
            else f"""
                LIMIT {pagination.page_size} OFFSET {pagination.page_index * pagination.page_size}
                """
        )
        # Query data
        cursor.execute(
            f"""
            {sql_epxr}
            {pagination_to_use}
            """
        )

        rows = cursor.fetchall()
        # Get column names from the cursor description
        column_names = [description[0] for description in cursor.description]
        # Convert rows to a list of dictionaries
        data = [dict(zip(column_names, row)) for row in rows]

        if len(columns_to_jsonify) > 0:
            for item in data:
                for column in columns_to_jsonify:
                    if column in item:
                        try:
                            # Parse the JSON string and pretty print it
                            item[column] = json.dumps(
                                json.loads(item[column]), indent=4
                            )
                        except json.JSONDecodeError:
                            print(f"Invalid JSON in row: {item}")

                for column in columns_to_truncate:
                    if column in item:
                        try:
                            item[column] = ("\n".join(item[column].split("\n")))[
                                :data_size_limit
                            ]
                        except json.JSONDecodeError:
                            print(f"Invalid JSON in row: {item}")

        SbsSqlite.print_truncated_values(data)

        return data

    @classmethod
    def db_update_common(
        cls,
        cursor,
        table_name: str,
        where_expr: str,
        item: SbsSessionUpdateRequest | SbsFactReviewRequest,
    ):
        # Convert the item object to a dictionary
        update_data = item.__dict__

        # Generate the SQL update statement
        set_clause = ", ".join([f"{key} = ?" for key in update_data.keys()])
        sql = f"UPDATE {table_name} SET {set_clause} WHERE {where_expr}"

        # Execute the update statement
        cursor.execute(sql, (*update_data.values(),))

    def db_create_sessions_table(self):
        self.enter()
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sbs_session (
                id INTEGER PRIMARY KEY,
                fact_count INTEGER DEFAULT 0,
                path TEXT NOT NULL,
                reviewer TEXT NULL,
                review_date TEXT NULL
            )
            """
        )
        self.exit()

    def db_create_fact_table(self):
        self.enter()
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
                score INTEGER NULL,
                reviewer TEXT NULL,
                review_date TEXT NULL
            )
            """
        )
        self.exit()

    def db_upsert_sbs_sessions(self, paths: List[sbs_session]) -> int:
        total_count = 0
        self.enter()

        for path in paths:
            count = SbsSqlite.fetch_row_count(
                self.cursor, f"sbs_session WHERE path = '{path.path}'"
            )

            if count > 0:
                logger.info(f"Session already exists for {path.path}")
            else:
                logger.info(f"Creating new session for {path.path}")
                # Insert data
                self.cursor.execute(
                    """
                    INSERT INTO sbs_session (path)
                    VALUES (?)
                    """,
                    (path.path,),
                )

                id = self.cursor.lastrowid or 0

                logger.info(f"Session {id} added for {path.path}")

            total_count += 1

        self.exit()

        return total_count

    def db_sbs_session_list(
        self,
        session_id_to_fetch: int = 0,
        pagination: CommonQueryParamsPagination = None,
    ):
        self.enter()

        sql_expr_suffix = (
            f"WHERE id = {session_id_to_fetch}" if session_id_to_fetch > 0 else ""
        )
        total_count = (
            SbsSqlite.fetch_row_count(self.cursor, "sbs_session")
            if session_id_to_fetch == 0
            else 1
        )
        data = SbsSqlite.fetch_data(
            self.cursor,
            f"""
            SELECT
                id,
                fact_count,
                path,
                reviewer,
                review_date
            FROM sbs_session
            {sql_expr_suffix}
            """,
            pagination,
        )

        self.exit()

        return data, total_count

    # Query the database
    def db_get_sbs_fact_list(
        self,
        session_id_to_fetch: int,
        fact_id_to_fetch: int = 0,
        pagination: CommonQueryParamsPagination = None,
    ):
        self.enter()

        if fact_id_to_fetch > 0:
            sql_expr_suffix = f" and id = {fact_id_to_fetch}"
            pagination_to_use = None
            data_size_limit = 250000
            total_count = 1
        else:
            sql_expr_suffix = ""
            pagination_to_use = pagination
            data_size_limit = 100
            total_count = SbsSqlite.fetch_row_count(
                self.cursor,
                f"""
                sbs_fact
                WHERE session_id = {session_id_to_fetch}
                """,
            )

        data = SbsSqlite.fetch_data(
            self.cursor,
            f"""
            SELECT
                id,
                session_id,
                main_clause,
                subclause_id,
                subclause,
                content,
                score_completeness,
                explanation_completeness,
                draft_id,
                content_id,
                SUBSTR(document_text_reference, 1, {data_size_limit})
                    as document_text_reference,
                draft,
                score,
                reviewer,
                review_date
            FROM sbs_fact
            WHERE session_id = {session_id_to_fetch} {sql_expr_suffix}
            """,
            pagination_to_use,
            ["draft"],
            ["document_text_reference", "draft"],
            data_size_limit,
        )

        self.exit()

        return data, total_count

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

    # Patch the sbs_session table
    def db_patch_sbs_session(self, session_id: int, item: SbsSessionUpdateRequest):
        self.enter()
        SbsSqlite.db_update_common(self.cursor, "sbs_session", f"id={session_id}", item)
        self.exit()

    # Patch the sbs_fact table
    def db_patch_sbs_fact(
        self, session_id: int, fact_id: int, item: SbsFactReviewRequest
    ):
        self.enter()
        SbsSqlite.db_update_common(
            self.cursor, "sbs_fact", f"id={fact_id} and session_id={session_id}", item
        )
        self.exit()
