SELECT
  *
FROM 
  EVStation JOIN HasPlugs
    ON EVStation.station_id = HasPlugs.station_id
  JOIN PlugInstance
    ON HasPlugs.instance_id = PlugInstance.instance_id
WHERE
  EVStation.station_id = %(station_id)s;
