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
