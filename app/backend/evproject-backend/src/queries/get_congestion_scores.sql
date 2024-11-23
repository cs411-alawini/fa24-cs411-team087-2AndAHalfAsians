SELECT DISTINCT
    Distances.station_id,
    Distances.state_code,
    Distances.distance_km,
  ROUND(AVG(HourVolumeData.volume), 1) AS avg_volume,
  ROUND(
  1/(1+EXP((distance_km-%(distance_threshold)s/2.0)/10)) * ROUND(AVG(HourVolumeData.volume), 1)
  ,2) AS CongestionScore
FROM (
    SELECT
        latitude,
        longitude,
        station_id,
        state_code,
        (
            6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN(RADIANS(latitude - (%(latitude)s)) / 2), 2) +
                    COS(RADIANS(%(latitude)s)) *
                    COS(RADIANS(latitude)) *
                    POWER(SIN(RADIANS(longitude - (%(longitude)s)) / 2), 2)
                )
            )
        ) AS distance_km
    FROM TrafficStation
    WHERE
        latitude
        BETWEEN %(latitude)s - (%(distance_threshold)s/111.0)
            AND %(latitude)s + (%(distance_threshold)s/111.0)
        AND
        longitude
        BETWEEN (%(longitude)s) - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s))))
            AND (%(longitude)s) + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(latitude)s))))
) AS Distances
JOIN TrafficStation
    ON Distances.station_id = TrafficStation.station_id
    AND Distances.state_code = TrafficStation.state_code
JOIN TrafficVolume
  ON Distances.station_id = TrafficVolume.station_id
  AND Distances.state_code = TrafficVolume.state_code
JOIN HourVolumeData
  ON TrafficVolume.volume_id = HourVolumeData.volume_id
WHERE
    distance_km <= %(distance_threshold)s
  AND HourVolumeData.hour BETWEEN %(current_hour)s-%(hour_range)s AND %(current_hour)s+%(hour_range)s
GROUP BY
  TrafficStation.station_id,
  TrafficVolume.state_code,
  TrafficVolume.station_id
ORDER BY
    Distances.distance_km ASC;