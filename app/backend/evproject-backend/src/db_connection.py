import mysql.connector
from mysql.connector import Error
from mysql.connector.cursor import MySQLCursor
import os
from contextlib import contextmanager
from typing import Optional, Generator, Dict

import mysql.connector.cursor

class DatabaseConnectionPool:

    _connectionPool = None
    _poolSize = 10
    
    # The @classmethod decorator lets us interact easily with the class variables.
    # Class variables are different from instance variables since they are shared
    # by all members of the class. We *could* split this into a more instanced
    # class by managing different pools of connections, like one for reading
    # one for writing, etc. but that's a bit too complciated.
    @classmethod
    def _initPool(cls) -> None:
        '''
        Initialize a shared database connection pool with multiple connections so we can
        perform multiple operations at once without having to wait on a single connection
        '''
        if cls._connectionPool:
            print('Pool already exists!')
            return

        try:
            poolConfig = {
                "pool_name": "primary_pool", # No spaces allowed in the pool name I guess?
                "pool_size": cls._poolSize,
                "host": os.getenv("DB_HOST", "34.29.173.177"),
                "user": os.getenv("DB_USER", "root"),
                "password": os.getenv("DB_PASSWORD", "team087"),
                "database": os.getenv("DB_NAME", "team087-db"),
                "port": os.getenv("DB_PORT", "3306"),
                "autocommit": True, # Automatically commit transactions after a connection is done
                "pool_reset_session": True, # Reset session variables when connection is returned to pool
            }
            
            # Create the pool of connections based on the above configuration
            cls._connectionPool = mysql.connector.pooling.MySQLConnectionPool(**poolConfig)
            print(f'Created database pool named {poolConfig["pool_name"]} with {cls._poolSize} connections!')
            
        except Error as e: # This is the special Error exception provided by MySQL
            print(f'Error initializing pool!! {e}')
            # raise on its own raises the active exception e
            raise
            
    @classmethod
    def getConnection(cls) -> Optional[mysql.connector.MySQLConnection]:
        '''
        Get a single connection from the pool.
        We can use this connection to get a cursor to iterate over stuff and execute queries
        '''
        
        if cls._connectionPool is None:
            cls._initPool()
        
        try:
            return cls._connectionPool.get_connection()
        except Error:
            print(f'Error getting connection from pool!')
            raise

        
# Since the MySQLCursor is a generator, we need to set the Generator return type
# It takes the type of item yielded, type of arguments, and type of the return itself?
@contextmanager
def getDBCursor() -> Generator[MySQLCursor, None, None]:
    '''
    Get an individual DB cursor from the shared connection pool. The cursor 
    is a generator which returns individual records as a dict when interated over.
    '''
    connection = DatabaseConnectionPool.getConnection()

    if not connection:
        raise Exception('Couldn\'t get a connection from the pool!')
    
    # Get a cursor from the connection returning dictionaries
    cursor = connection.cursor(dictionary=True)
    
    try:
        # We will "return" a cursor here, but once the cursor exits the current
        # context, we will continue within this function and commit or rollback if things blew up
        yield cursor
        connection.commit()
    except Error as e:
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
        print('Closed cursor & returned connection to the pool')
    