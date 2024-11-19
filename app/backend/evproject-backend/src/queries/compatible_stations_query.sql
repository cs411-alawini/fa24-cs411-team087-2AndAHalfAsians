SELECT
	Distances.ev_station_id,
	Distances.distance_km,
	PlugInstance.type_id,
	PlugInstance.power_output,
	PlugInstance.in_use,
	PlugInstance.base_price,
	PlugInstance.usage_price,
	EVStation.name,
	EVStation.address,
	EVStation.state,
	EVStation.zip,
	EVStation.latitude,
	EVStation.longitude,
	EVStation.city,
	EVStation.phone,
	ROUND((SELECT battery_capacity FROM ElectricVehicle WHERE ev_id=%(ev_id)s) / PlugInstance.power_output, 2) AS time_to_charge_hr,
	ROUND(base_price +
	ROUND((SELECT battery_capacity FROM ElectricVehicle WHERE ev_id=%(ev_id)s), 2) * usage_price
	,2) AS price_to_charge
FROM (
	SELECT
		latitude,
		longitude,
		station_id AS ev_station_id,
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
		latitude
		BETWEEN %(latitude)s - (%(distance_threshold)s/111.0)
			AND %(latitude)s + (%(distance_threshold)s/111.0)
		AND
		longitude
		BETWEEN %(longitude)s - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s)) ))
			AND %(longitude)s + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s)) ))
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
