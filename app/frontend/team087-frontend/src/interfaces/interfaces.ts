
// Define interfaces for individual tables/queries as needed

// Basic interface for the EVStation table
export interface EVStation {
    station_id: number,
    name: string,
    latitude: number,
    longitude: number,
    state: string,
    zip: number,
    city: string,
    address: string,
    phone: string
}

// Specific interface for the combatible EVStation results (Q1) which has extra stuff like prices
export interface CompatibleEVStation {
    ev_station_id: number,
    distance_km: number,
    type_id: number,
	power_output: number,
	in_use: boolean,
	base_price: number,
	usage_price: number,
	name: string,
	address: string,
	state: string,
	zip: string,
	latitude: number,
	longitude: number,
    city: string,
    phone: string,
    time_to_charge_hr: number,
	price_to_charge: number
}



export const getCompatibleStations = async (latitude: string, 
    longitude: string, 
    distance_threshold: string, 
    ev_id: string): Promise<CompatibleEVStation[]> => {
        const response = await fetch(`https://evproject-backend-service-410247726474.us-central1.run.app/CompatibleStations/?latitude=${latitude}&longitude=${longitude}&distance_threshold=${distance_threshold}&ev_id=${ev_id}`);
        console.log('Raw response', response);
        const results = response.json();
        console.log('JSON results', results);
        return results;
    }