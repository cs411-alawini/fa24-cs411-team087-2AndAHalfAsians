// src/api/EVStations.ts

export interface EVStation {
    station_id: number;
    name: string;
    latitude: number;
    longitude: number;
    state: string;
    zip: string;
    city: string;
    address: string;
    phone: string;
    RAND: number;
}

// Define the base URL for the backend API
const BASE_URL =
    "https://evproject-backend-service-41https://evproject-backend-service-410247726474.us-central1.run.app/EVStation/getEVStations?resultsLimit=1000247726474.us-central1.run.app";

/**
 * Fetch EV Stations from the backend API.
 * @returns A promise that resolves to an array of EVStation objects.
 */
export const getEVStations = async (): Promise<EVStation[]> => {
    try {
        const response = await fetch(
            `${BASE_URL}/EVStation/getEVStations?resultsLimit=1`
        );
        if (!response.ok) {
            throw new Error(
                `Error fetching EV stations: ${response.statusText}`
            );
        }
        const data: EVStation[] = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch EV stations:", error);
        throw error;
    }
};
