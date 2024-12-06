SELECT
  EVS.station_id,
  EVS.name AS station_name,
  EVS.address,
  EVS.city,
  state,
  COUNT(PI.instance_id) AS available_plugs,
  Distances.distance_km
FROM (
  SELECT
    latitude,
    longitude,
    EVStation.station_id AS ev_station_id,
    ( 6371 * 2 * ASIN( SQRT( POWER(SIN(RADIANS(latitude - (%(latitude)s)) / 2), 2) + COS(RADIANS(%(latitude)s)) * COS(RADIANS(latitude)) * POWER(SIN(RADIANS(longitude - (%(longitude)s)) / 2), 2) ) ) ) AS distance_km
  FROM
    EVStation -- EVStation || TrafficStation
  WHERE
    latitude BETWEEN %(latitude)s - (%(distance_threshold)s/111.0)
    AND %(latitude)s + (%(distance_threshold)s/111.0)
    AND longitude BETWEEN %(longitude)s - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s))))
    AND %(longitude)s + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s)))) ) AS Distances
JOIN EVStation EVS
	ON Distances.ev_station_id = EVS.station_id
JOIN HasPlugs HP
	ON EVS.station_id = HP.station_id
JOIN PlugInstance PI
	ON HP.instance_id = PI.instance_id
WHERE
  PI.in_use = FALSE
  AND Distances.distance_km <= %(distance_threshold)s
GROUP BY
  EVS.station_id,
  EVS.name,
  EVS.address,
  EVS.city,
  EVS.state
ORDER BY
  Distances.distance_km ASC,
  available_plugs DESC;