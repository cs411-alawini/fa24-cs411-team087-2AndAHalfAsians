// Define interfaces for individual tables/queries as needed

import { BASE_URL } from "@/lib/query";

// Basic interface for the EVStation table
export interface EVStation {
    station_id: number;
    name: string;
    latitude: number;
    longitude: number;
    state: string;
    zip: number;
    city: string;
    address: string;
    phone: string;
}

export interface ElectricVehicle {
    ev_id: number;
    make: string;
    model: string;
    plug_type: number;
    range_km: number;
    battery_capacity: number;
}

// Specific interface for the combatible EVStation results (Q1) which has extra stuff like prices
export interface CompatibleEVStation {
    ev_station_id: number;
    distance_km: number;
    type_id: number;
    power_output: number;
    in_use: boolean;
    base_price: number;
    usage_price: number;
    name: string;
    address: string;
    state: string;
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    phone: string;
    time_to_charge_hr: number;
    price_to_charge: number;
}

// TODO: Refactor these URLs because this is gonna get ugly after a while
export const getCompatibleStations = async (
    latitude: string,
    longitude: string,
    distance_threshold: string,
    ev_id: string
): Promise<CompatibleEVStation[]> => {
    const apiURL: string = `${BASE_URL}/CustomQueries/CompatibleStations/?latitude=${latitude}&longitude=${longitude}&distance_threshold=${distance_threshold}&ev_id=${ev_id}`;
    const response = await fetch(apiURL);
    console.log("Endpoint Hit", apiURL);
    console.log("Raw response", response);
    const results = response.json();
    console.log("JSON results", results);
    return results;
};

export const executeOwnsEVQuery = async (
    mode: string,
    user_id: string,
    ev_id: string,
    previous_ev_id: string,
    new_ev_id: string
): Promise<ElectricVehicle[]> => {
    let apiURL: string = ``;

    // switch (mode) {
    //     case 'CREATE':
    //         apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/InsertOwnedVehicle/?user_id=${user_id}&ev_id=${ev_id}`;
    //         break;
    //     case 'READ':
    //         apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/GetOwnedVehicles/?user_id=${user_id}`;
    //         break;
    //     case 'UPDATE':
    //         apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/UpdateOwnedVehicles/?user_id=${user_id}&previous_ev_id=${previous_ev_id}&new_ev_id=${new_ev_id}`;
    //         break;
    //     case 'DELETE':
    //         apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/DeleteOwnedVehicle/?user_id=${user_id}&ev_id=${ev_id}`;
    //         break;
    //     default:
    //         apiURL = '';
    //         break;
    // }

    // Maybe refactor to this?
    const fetchOptions: RequestInit = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    switch (mode) {
        // TODO This is blowing up with CORS errors but it still executes??? Maybe a backend problem
        case "CREATE":
            // apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/InsertOwnedVehicle/`;
            apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/InsertOwnedVehicle/?user_id=${user_id}&ev_id=${ev_id}`;
            fetchOptions.method = "POST";
            // fetchOptions.body = JSON.stringify({
            //     user_id: user_id,
            //     ev_id: ev_id
            // });
            break;
        case "READ":
            apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/GetOwnedVehicles/?user_id=${user_id}`;
            fetchOptions.method = "GET";
            break;
        case "UPDATE":
            // apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/UpdateOwnedVehicles`;
            apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/UpdateOwnedVehicles/?user_id=${user_id}&previous_ev_id=${previous_ev_id}&new_ev_id=${new_ev_id}`;
            fetchOptions.method = "PUT";
            // fetchOptions.body = JSON.stringify({
            //     user_id: user_id,
            //     previous_ev_id: previous_ev_id,
            //     new_ev_id: new_ev_id
            // });
            break;
        case "DELETE":
            // apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/DeleteOwnedVehicles`;
            apiURL = `https://evproject-backend-service-410247726474.us-central1.run.app/OwnsEV/DeleteOwnedVehicle/?user_id=${user_id}&ev_id=${ev_id}`;
            fetchOptions.method = "DELETE";
            // fetchOptions.body = JSON.stringify({
            //     user_id: user_id,
            //     ev_id: ev_id
            // });
            break;
        default:
            apiURL = "";
            break;
    }
    const response = await fetch(apiURL, fetchOptions);

    console.log("mode", mode);
    console.log("Endpoint Hit", apiURL);
    // const response = await fetch(apiURL);
    console.log("Raw response", response);
    const data = response.json();

    console.log("Response data:", {
        raw: data,
        type: typeof data,
        isArray: Array.isArray(data),
    });

    return data;
};

export interface GetBestElectricVehiclesForTripResults {
    ev_station_city: string;
    type_id: number;
    type_count: number;
    ev_id: number;
    make: string;
    model: string;
    plug_type: number;
    range_km: number;
    battery_capacity: number;
    time_to_charge_hr: number;
    expected_charge_cost_per_hundred_km: number;
}

export interface GetBestElectricVehiclesForTripParams {
    city1_latitude: number;
    city1_longitude: number;
    city2_latitude: number;
    city2_longitude: number;
    distance_threshold: number;
}
