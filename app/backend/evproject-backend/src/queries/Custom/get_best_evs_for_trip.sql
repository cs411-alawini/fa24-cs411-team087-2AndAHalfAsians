SELECT  
EVStationCounts.ev_station_city,
EVStationCounts.type_id,
EVStationCounts.type_count,
ElectricVehicle.*,
ROUND(ElectricVehicle.battery_capacity / EVStationCounts.avg_power_output, 2) AS time_to_charge_hr,  
ROUND(  
    (EVStationCounts.avg_base_price +  
    ElectricVehicle.battery_capacity * EVStationCounts.avg_useage_price) /  
    ElectricVehicle.range_km * 100  
, 2) AS expected_charge_cost_per_hundred_km  
FROM  
(  
SELECT * FROM  
(  
    SELECT  
        Distances1.ev_station_city,  
        PI.type_id,  
        COUNT(PI.type_id) AS type_count,  
        ROUND(AVG(PI.usage_price), 2) AS avg_useage_price,  
        ROUND(AVG(PI.base_price), 2) AS avg_base_price,  
        ROUND(AVG(PI.power_output), 2) AS avg_power_output  
    FROM (  
        SELECT  
            latitude,  
            longitude,  
            (  
                6371 * 2 * ASIN(  
                    SQRT(  
                        POWER(SIN(RADIANS(latitude - (%(city1_latitude)s)) / 2), 2) +  
                        COS(RADIANS(%(city1_latitude)s)) *  
                        COS(RADIANS(latitude)) *  
                        POWER(SIN(RADIANS(longitude - (%(city1_longitude)s)) / 2), 2)  
                    )  
                )  
            ) AS distance_km,  
            EVStation.station_id AS ev_station_id,  
            EVStation.city AS ev_station_city  
        FROM EVStation -- EVStation || TrafficStation  
        WHERE  
            latitude  
            BETWEEN %(city1_latitude)s - (%(distance_threshold)s/111.0)  
                AND %(city1_latitude)s + (%(distance_threshold)s/111.0)  
            AND  
            longitude  
            BETWEEN %(city1_longitude)s - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(city1_latitude)s))))  
                AND %(city1_longitude)s + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(city1_latitude)s))))  
    ) AS Distances1  
    JOIN HasPlugs HP  
        ON HP.station_id = Distances1.ev_station_id  
    JOIN PlugInstance PI  
        ON HP.instance_id = PI.instance_id  
    GROUP BY  
        PI.type_id,  
        Distances1.ev_station_city  
) AS City1Info  
UNION  
(  
    SELECT  
        Distances2.ev_station_city,  
        PI.type_id,  
        COUNT(PI.type_id) AS type_count,  
        ROUND(AVG(PI.usage_price), 2) AS avg_useage_price,  
        ROUND(AVG(PI.base_price), 2) AS avg_base_price,  
        ROUND(AVG(PI.power_output), 2) AS avg_power_output  
    FROM (  
        SELECT  
            latitude,  
            longitude,  
            (  
                6371 * 2 * ASIN(  
                    SQRT(  
                        POWER(SIN(RADIANS(latitude - (%(city2_latitude)s)) / 2), 2) +  
                        COS(RADIANS(%(city2_latitude)s)) *  
                        COS(RADIANS(latitude)) *  
                        POWER(SIN(RADIANS(longitude - (%(city2_longitude)s)) / 2), 2)  
                    )  
                )  
            ) AS distance_km,  
            EVStation.station_id AS ev_station_id,  
            EVStation.city AS ev_station_city  
        FROM EVStation -- EVStation || TrafficStation  
        WHERE  
            latitude  
            BETWEEN %(city2_latitude)s - (%(distance_threshold)s/111.0)  
                AND %(city2_latitude)s + (%(distance_threshold)s/111.0)  
            AND  
            longitude  
            BETWEEN %(city2_longitude)s - (%(distance_threshold)s/(111.0 * COS(RADIANS(%(city2_latitude)s))))  
                AND %(city2_longitude)s + (%(distance_threshold)s/(111.0 * COS(RADIANS(%(city2_latitude)s))))  
    ) AS Distances2  
    JOIN HasPlugs HP  
        ON HP.station_id = Distances2.ev_station_id  
    JOIN PlugInstance PI  
        ON HP.instance_id = PI.instance_id  
    GROUP BY  
        PI.type_id,  
        Distances2.ev_station_city  
)  
) AS EVStationCounts  
JOIN ElectricVehicle  
ON EVStationCounts.type_id = ElectricVehicle.plug_type  
  
  
ORDER BY  
expected_charge_cost_per_hundred_km ASC,  
type_count DESC