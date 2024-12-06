import numpy as np

def genericInsertQuery(table:str, params:dict):
    
    '''
    Allows a generic insert into a table given some dict of fields.
    
    Arguments:
        table: The table the record should be added to
        params: A dict with field:value pairs
        
    Returns:
        query: A formatted query that can be run with the same params
            by using cursor.execute(genericInsertQuery(table, params), params)
    '''
    
    fields = list(params.keys())
    # Construct a set of formatted fields
    formattedFields = [f'%({field})s' for field in fields]
    
    query = f'''
    INSERT INTO {table}({', '.join(fields)})
    VALUES ({', '.join(formattedFields)});
    '''
    
    return query


def genericReadQuery(table:str, key:str):
    
    '''
    A generic read query generator
    
    Arguments:
        table: The table to read from
        key: The key of the record we are searching
        
    Returns:
        query: A formatted query that can be run with the same params
            by using cursor.execute(genericUpdateQuery(table, key, params), params)
    '''
    
    query = f'''
    SELECT * FROM {table}
    WHERE {key} = %({key})s;
    '''
    
    return query

def genericUpdateQuery(table:str, key:str, params:dict):
    
    '''
    A generic update into a table given some dict of fields.
    
    Arguments:
        table: The table the record should be added to
        key: The key of the object we are updating. We don't want to overwrite everything do we?
        params: A dict with field:value pairs. 
        
    Returns:
        query: A formatted query that can be run with the same params
            by using cursor.execute(genericUpdateQuery(table, key, params), params)
    '''
    
    fields = list(params.keys())
    # Remove the key so we don't include it in the update
    fields.remove(key)
    setClauses = [f'{field} = %({field})s' for field in fields]
    
    query = f'''
    UPDATE {table}
    SET {', '.join(setClauses)}
    WHERE {key} = %({key})s;
    '''
    
    return query


def genericDeleteQuery(table:str, key:str):

    '''
    A generic `delete a single record` function.
    
    Arguments:
        table: The table the record should be added to
        key: The key of the object we are deleting. We don't want to delete everything do we?
        
    Returns:
        query: A formatted query that can be run with the same params
            by using cursor.execute(genericDeleteQuery(table, key), params)
    '''
    
    query = f'''
    DELETE FROM {table}
    WHERE {key} = %({key})s;
    '''
    
    return query


def haversine(lat1:float, long1:float, lat2s:np.ndarray, long2s:np.ndarray):
    """
    Calculate haversine distance
    Slightly modified from https://stackoverflow.com/questions/4913349/haversine-formula-in-python-bearing-and-distance-between-two-gps-points
    """
    # Convert decimal degrees to radians
    lat1, long1 = np.radians(lat1), np.radians(long1)
    lat2, long2 = np.radians(lat2s), np.radians(long2s)
    dlon = long2 - long1 
    dlat = lat2 - lat1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles. Determines return value units.
    return c * r

def softmax(x, temp):
    return np.exp(x/temp) / (np.sum(np.exp(x/temp)))