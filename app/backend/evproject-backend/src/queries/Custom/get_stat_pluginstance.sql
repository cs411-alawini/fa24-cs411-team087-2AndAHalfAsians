SELECT
  PI.type_id,
  COUNT(PI.type_id) AS type_count,
  ROUND(AVG(base_price), 2) AS avg_base_price,
  ROUND(AVG(usage_price), 2) AS avg_useage_price
FROM
EVStationDistances
JOIN HasPlugs
  ON EVStationDistances.ev_station_id = HasPlugs.station_id
JOIN PlugInstance PI
  ON HasPlugs.instance_id = PI.instance_id
GROUP BY
  PI.type_id
