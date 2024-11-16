UPDATE   
  OwnsEV
SET OwnsEV.ev_id = %(new_ev_id)s
WHERE 
  OwnsEV.user_id = %(user_id)s
  AND OwnsEV.ev_id = %(previous_ev_id)s;
