SELECT DISTINCT
  TrafficStationDistances.station_id,
  TrafficStationDistances.state_code,
  TrafficStationDistances.distance_km,
  TrafficStationDistances.latitude,
  TrafficStationDistances.longitude,
  ROUND(AVG(HourVolumeData.volume), 1) AS avg_volume,
  ROUND(
  1/(1+EXP((distance_km-%(distance_threshold)s/2.0)/10)) * ROUND(AVG(HourVolumeData.volume), 1)
  ,2) AS CongestionScore
FROM 
TrafficStationDistances
JOIN TrafficStation
  ON TrafficStationDistances.station_id = TrafficStation.station_id
  AND TrafficStationDistances.state_code = TrafficStation.state_code
JOIN TrafficVolume
  ON TrafficStationDistances.station_id = TrafficVolume.station_id
  AND TrafficStationDistances.state_code = TrafficVolume.state_code
JOIN HourVolumeData
  ON TrafficVolume.volume_id = HourVolumeData.volume_id
WHERE
  HourVolumeData.hour BETWEEN %(current_hour)s-%(hour_range)s AND %(current_hour)s+%(hour_range)s
GROUP BY
  TrafficStation.station_id,
  TrafficVolume.state_code,
  TrafficVolume.station_id,
  TrafficStationDistances.distance_km,
  TrafficStationDistances.latitude,
  TrafficStationDistances.longitude
ORDER BY
  TrafficStationDistances.distance_km ASC;