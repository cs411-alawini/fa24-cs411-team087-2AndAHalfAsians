import { BASE_URL } from "@/lib/query";

import { CompatibleEVStationsForm, EVStationArray } from "@/schemas";
import { CompatibleEVStation } from "@/interfaces/interfaces";

/**
 * Fetch EV Stations from the backend API.
 * @returns An array of EVStation objects.
 */
export async function getEVStations() {
    try {
        const response = await fetch(
            `${BASE_URL}/EVStation/getEVStations/?resultsLimit=1`
        );
        if (!response.ok) {
            throw new Error(
                `Error fetching EV stations: ${response.statusText}`
            );
        }
        const data = await response.json();

        const stations = EVStationArray.parse(data);
        return stations;
    } catch (error) {
        console.error("Failed to fetch EV stations:", error);
        throw error;
    }
}

export async function getCompatibleStations(
    data: CompatibleEVStationsForm
): Promise<CompatibleEVStation[]> {
    try {
        // Destructure the data object
        const { latitude, longitude, distance_threshold, ev_id } = data;

        // Construct query parameters using URLSearchParams
        const params = new URLSearchParams({
            latitude,
            longitude,
            distance_threshold,
            ev_id,
        });

        // Perform the fetch request with constructed query string
        const response = await fetch(
            `${BASE_URL}/CustomQueries/CompatibleStations/?${params.toString()}`
        );

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(
                `Error fetching EV stations: ${response.statusText}`
            );
        }

        // Parse and return the JSON response
        const stations: CompatibleEVStation[] = await response.json();
        return stations;
    } catch (error) {
        console.error("Failed to fetch compatible EV stations:", error);
        throw error;
    }
}

import {
    GetBestElectricVehiclesForTripParams,
    GetBestElectricVehiclesForTripResults,
} from "@/interfaces/interfaces";

export async function getBestElectricVehiclesForTrip(
    data: GetBestElectricVehiclesForTripParams
): Promise<GetBestElectricVehiclesForTripResults[]> {
    try {
        const params = new URLSearchParams({
            city1_latitude: data.city1_latitude.toString(),
            city1_longitude: data.city1_longitude.toString(),
            city2_latitude: data.city2_latitude.toString(),
            city2_longitude: data.city2_longitude.toString(),
            distance_threshold: data.distance_threshold.toString(),
        });

        const response = await fetch(
            `${BASE_URL}/CustomQueries/GetBestElectricVehiclesForTrip/?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(
                `Error fetching best EVs for trip: ${response.statusText}`
            );
        }

        const results: GetBestElectricVehiclesForTripResults[] =
            await response.json();
        return results;
    } catch (error) {
        console.error("Failed to fetch best EVs for trip:", error);
        throw error;
    }
}
