SELECT
	EVStationDistances.ev_station_id,
	EVStationDistances.distance_km,
	EVStation.name,
	EVStation.address,
	EVStation.state,
	EVStation.zip,
	EVStation.latitude,
	EVStation.longitude,
	EVStation.city,
	EVStation.phone
FROM 
EVStationDistances
JOIN EVStation
	ON EVStationDistances.ev_station_id = EVStation.station_id
ORDER BY
	EVStationDistances.distance_km ASC;