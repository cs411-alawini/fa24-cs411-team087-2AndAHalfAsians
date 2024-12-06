SELECT
  EVS.station_id,
  EVS.name AS station_name,
  EVS.address,
  EVS.city,
  state,
  COUNT(PI.instance_id) AS available_plugs,
  EVStationDistances.distance_km
FROM 
EVStationDistances JOIN EVStation EVS
  ON EVStationDistances.ev_station_id = EVS.station_id
JOIN HasPlugs HP
  ON EVS.station_id = HP.station_id
JOIN PlugInstance PI
  ON HP.instance_id = PI.instance_id
WHERE
  PI.in_use = FALSE
GROUP BY
  EVS.station_id,
  EVS.name,
  EVS.address,
  EVS.city,
  EVS.state,
  EVStationDistances.distance_km
ORDER BY
  EVStationDistances.distance_km ASC,
  available_plugs DESC;