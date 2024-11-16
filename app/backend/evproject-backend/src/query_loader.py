import os


def load_query(query_name: str, query_path: str='queries') -> str:
    """
    Load a SQL query from a file in the queries directory.
    :param query_name: Name of the SQL file (without .sql extension)
    :return: SQL query as a string
    """
    file_path = os.path.join(os.path.join(os.path.dirname(__file__)), query_path, f"{query_name}.sql")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Query file '{file_path}' not found.")

    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()