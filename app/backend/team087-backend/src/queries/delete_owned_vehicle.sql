DELETE FROM
	OwnsEV
WHERE
	user_id = %(user_id)s
 	AND ev_id = %(ev_id)s;
