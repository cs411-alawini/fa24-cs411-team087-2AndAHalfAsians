import { BASE_URL } from "@/lib/query";
import { User, ElectricVehicleArray } from "@/schemas";

// Fetch a user's data by ID
export async function fetchUser(userId: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/User/GetUser?userId=${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
    }

    return response.json();
}

// Update user profile
export async function updateUser(
    userId: string,
    updatedData: Partial<User>
): Promise<User> {
    const params = new URLSearchParams(updatedData as Record<string, string>);

    const response = await fetch(
        `${BASE_URL}/User/UpdateUser?userId=${userId}&${params.toString()}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Error updating user data: ${response.statusText}`);
    }

    return response.json();
}

// Fetch owned vehicles for a user
export async function fetchOwnedVehicles(
    userId: string
): Promise<ElectricVehicle[]> {
    const response = await fetch(
        `${BASE_URL}/OwnsEV/GetOwnedVehicles/?user_id=${userId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            `Error fetching owned vehicles: ${response.statusText}`
        );
    }

    const data = await response.json();
    return ElectricVehicleArray.parse(data); // Validate response
}
