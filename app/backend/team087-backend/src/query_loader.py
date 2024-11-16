import os


class QueryLoader:
    def __init__(self, query_dir: str):
        self.query_dir = query_dir

    def load_query(self, query_name: str) -> str:
        """
        Load a SQL query from a file in the queries directory.
        :param query_name: Name of the SQL file (without .sql extension)
        :return: SQL query as a string
        """
        file_path = os.path.join(self.query_dir, f"{query_name}.sql")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Query file '{file_path}' not found.")

        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
