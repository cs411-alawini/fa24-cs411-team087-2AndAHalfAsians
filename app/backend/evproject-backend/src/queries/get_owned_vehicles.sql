SELECT
	EV.ev_id,
	EV.make,
	EV.model,
	PlugType.type_id,
	PlugType.type_name,
	EV.range_km,
	EV.battery_capacity
FROM
	User
	JOIN OwnsEV ON
	User.user_id = OwnsEV.user_id
	JOIN ElectricVehicle EV ON
	OwnsEV.ev_id = EV.ev_id
	JOIN PlugType ON
	EV.plug_type = PlugType.type_id
WHERE
	User.user_id = %(user_id)s;
