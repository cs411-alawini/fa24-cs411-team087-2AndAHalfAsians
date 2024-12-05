

def genericInsertQuery(table:str, argumentsDict:dict):
    
    fields = list(argumentsDict.keys())
    values = [f'%({field})s' for field in fields]
    
    query = f'''
    INSERT INTO {table}({', '.join(fields)})
    VALUES ({', '.join(values)});
    '''
    
    return query