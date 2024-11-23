SELECT
  U.first_name,
  U.last_name,
  U.email,
  GROUP_CONCAT(EV.make,
	' ',
	EV.model) AS vehicles_owned,
  COUNT(*) AS num_vehicles
FROM
  User U
JOIN
  OwnsEV OE
ON
  U.user_id = OE.user_id
JOIN
  ElectricVehicle EV
ON
  OE.ev_id = EV.ev_id
GROUP BY
  U.user_id
HAVING
  COUNT(*) > 1
ORDER BY
  num_vehicles DESC;
