import { BASE_URL } from "@/lib/query";
import { ElectricVehicle, ElectricVehicleArray } from "@/schemas";
import { NewVehicle, OwnedVehicle } from "@/schemas";

// Fetch all vehicles
export async function fetchAllVehicles(): Promise<ElectricVehicle[]> {
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/GetAllElectricVehicles/`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error fetching vehicles: ${response.statusText}`);
    }

    const data = await response.json();
    return ElectricVehicle.array().parse(data); // Validate response
}

// Fetch a single vehicle by ID
export async function fetchVehicleById(
    ev_id: number
): Promise<ElectricVehicle> {
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/GetElectricVehicleByEvId/?ev_id=${ev_id}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error fetching vehicle: ${response.statusText}`);
    }

    const data = await response.json();
    return ElectricVehicle.array().parse(data)[0]; // Validate response
}

// Create a new vehicle
export async function createVehicle(
    vehicle: ElectricVehicle
): Promise<ElectricVehicle> {
    const params = new URLSearchParams(
        Object.entries(vehicle).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    );
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/AddElectricVehicle/?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error creating vehicle: ${response.statusText}`);
    }

    const data = await response.json();
    return ElectricVehicle.array().parse(data)[0]; // Validate response
}

// Update an existing vehicle
export async function updateVehicle(
    vehicle: ElectricVehicle
): Promise<ElectricVehicle> {
    const params = new URLSearchParams(
        Object.entries(vehicle).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    );
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/UpdateElectricVehicle/?${params.toString()}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error updating vehicle: ${response.statusText}`);
    }

    const data = await response.json();
    return ElectricVehicle.array().parse(data)[0]; // Validate response
}

// Delete a vehicle by ID
export async function deleteVehicle(ev_id: number): Promise<void> {
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/DeleteElectricVehicle/?ev_id=${ev_id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error deleting vehicle: ${response.statusText}`);
    }
}

// Add a new vehicle
export async function addNewVehicle(vehicle: ElectricVehicle): Promise<void> {
    const params = new URLSearchParams(
        Object.entries(vehicle).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    );
    const response = await fetch(
        `${BASE_URL}/ElectricVehicle/AddElectricVehicle/?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error adding new vehicle: ${response.statusText}`);
    }
}

// Add an owned vehicle to a user
export async function addOwnedVehicle(
    ownedVehicle: OwnedVehicle
): Promise<void> {
    const params = new URLSearchParams(
        Object.entries(ownedVehicle).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    );
    const response = await fetch(
        `${BASE_URL}/OwnsEV/InsertOwnedVehicle/?${params.toString()}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error adding owned vehicle: ${response.statusText}`);
    }
}

// Delete an owned vehicle by user ID and EV ID
export async function deleteOwnedVehicle(
    userId: number,
    evId: number
): Promise<void> {
    const response = await fetch(
        `${BASE_URL}/OwnsEV/DeleteOwnedVehicle/?user_id=${userId}&ev_id=${evId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error deleting owned vehicle: ${response.statusText}`);
    }
}
