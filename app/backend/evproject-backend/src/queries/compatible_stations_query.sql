SELECT
	EVStationDistances.ev_station_id,
	EVStationDistances.distance_km,
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
FROM 
EVStationDistances
JOIN EVStation
	ON EVStationDistances.ev_station_id = EVStation.station_id
JOIN HasPlugs
	ON EVStation.station_id = HasPlugs.station_id
JOIN PlugInstance
	ON PlugInstance.instance_id = HasPlugs.instance_id
WHERE
	PlugInstance.type_id = (SELECT plug_type FROM ElectricVehicle WHERE ev_id = %(ev_id)s)
ORDER BY
	EVStationDistances.distance_km ASC;