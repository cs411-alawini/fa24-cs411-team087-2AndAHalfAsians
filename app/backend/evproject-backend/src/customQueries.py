from mysql.connector.cursor import MySQLCursor
from typing import List



class Queries():
    
    '''
    A generic class to hold all our queries
    '''
    
    Q1 = '''
SELECT
	Distances.ev_station_id,
	Distances.distance_km,
	PlugInstance.type_id,
	PlugInstance.power_output,
	PlugInstance.in_use,
	PlugInstance.base_price,
	PlugInstance.usage_price,
	EVStation.address,
	EVStation.state,
	EVStation.zip,
	EVStation.latitude,
	EVStation.longitude,
	ROUND((SELECT battery_capacity FROM ElectricVehicle WHERE ev_id=%(ev_id)s) / PlugInstance.power_output, 2) AS time_to_charge_hr,
	-- Total charge price is base price + price to charge to full
	-- Full charge price is usage_price ($/kwh)
	-- usage_price = #/kwh, battery_capacity = kwh,
	ROUND(base_price +
	ROUND((SELECT battery_capacity FROM ElectricVehicle WHERE ev_id=%(ev_id)s), 2) * usage_price
	,2) AS price_to_charge
FROM (
	SELECT
    	latitude,
    	longitude,
    	station_id AS ev_station_id,
    	-- Haversine formula implementation
    	-- R = Earth's radius in kilometers
    	ROUND(
        	(
        	6371 * 2 * ASIN(
            	SQRT(
                	POWER(SIN(RADIANS(latitude - (%(latitude)s)) / 2), 2) +
                	COS(RADIANS(%(latitude)s)) *
                	COS(RADIANS(latitude)) *
                	POWER(SIN(RADIANS(longitude - (%(longitude)s)) / 2), 2)
            	)
        	)
    	), 3) AS distance_km
	FROM EVStation
	WHERE
    	-- Pre-filtering using bounding box
    	-- 1 degree of latitude approx 111 km at the equator
    	-- Variance between latitude is mostly constant, so we can just
    	-- threshold based on the difference.
    	-- 1 degree of longitude varies with latitude
    	latitude
    	BETWEEN %(latitude)s - (%(distance_threshold)s/111.0)
        	AND %(latitude)s + (%(distance_threshold)s/111.0)
    	AND
    	longitude
    	BETWEEN %(longitude)s - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s))))
        	AND %(longitude)s + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s))))
) AS Distances
JOIN
EVStation
	ON Distances.ev_station_id = EVStation.station_id
JOIN HasPlugs
	ON EVStation.station_id = HasPlugs.station_id
JOIN PlugInstance
	ON PlugInstance.instance_id = HasPlugs.instance_id
WHERE
	distance_km <= %(distance_threshold)s
	AND PlugInstance.type_id = (SELECT plug_type FROM ElectricVehicle WHERE ev_id = %(ev_id)s)
ORDER BY
	Distances.distance_km ASC;
'''


    