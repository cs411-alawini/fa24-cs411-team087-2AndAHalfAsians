

class Queries():
	
	'''
	A generic class to hold all our queries
	'''
	
	READ_UNCOMMITTED = 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;'
	READ_COMMITTED = 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED;'
	REPEATABLE_READ = 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;'
	SERIALIZABLE = 'SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;'

	GET_OWNED_VEHICLES = '''
SELECT
	EV.ev_id,
	EV.make,
	EV.model,
	PlugType.type_id,
	PlugType.type_name,
	EV.range_km,
	EV.battery_capacity
FROM
	User
	JOIN OwnsEV ON
	User.user_id = OwnsEV.user_id
	JOIN ElectricVehicle EV ON
	OwnsEV.ev_id = EV.ev_id
	JOIN PlugType ON
	EV.plug_type = PlugType.type_id
WHERE
	User.user_id = %(user_id)s;
'''

	UPDATE_OWNED_VEHICLE = '''
UPDATE   
  OwnsEV
SET OwnsEV.ev_id = %(new_ev_id)s
WHERE 
  OwnsEV.user_id = %(user_id)s
  AND OwnsEV.ev_id = %(previous_ev_id)s;
'''


	INSERT_OWNED_VEHICLE = '''
INSERT INTO 
	OwnsEV(user_id, ev_id)
VALUES 
	(%(user_id)s, %(ev_id)s);
'''


	DELETE_OWNED_VEHICLE = '''
DELETE FROM
	OwnsEV
WHERE
	user_id = %(user_id)s
 	AND ev_id = %(ev_id)s;
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


	