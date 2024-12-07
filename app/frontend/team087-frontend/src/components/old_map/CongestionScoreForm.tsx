"use client"; // Add this to fix errors

import { useState, ChangeEvent, FormEvent } from "react";
import {
    CongestionScore,
    getCongestionScore,
} from "@/interfaces/interfaces";
import QueryResults from "./QueryResults";

// Define how we pass out the collected results to be displayed on the map
interface CompatibleStationsFormProps {
    onResultsUpdate: (result: CongestionScore[]) => void;
}

// Add our function here which will be sent to the parent
export default function CompatibleStationsForm({
    onResultsUpdate,
}: CompatibleStationsFormProps) {
    // Set the schema for the frontend form
    const [formData, setFormData] = useState({
        latitude: "34.040539",
        longitude: "-118.271387",
        distance_threshold: "40",
        hour_range: "2",
        hour_of_day: "12",
    });
    const [queryResults, setQueryResults] = useState<
        CongestionScore[] | null
    >(null);

    // eslint-disable-next-line
    const [showResults, setShowResults] = useState(false);

    // Update all fields as needed
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle form submission by getting the results through the getCompatibleStations function to properly cast the results for TS
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const results = await getCongestionScore(
            formData.latitude,
            formData.longitude,
            formData.distance_threshold,
            formData.hour_range,
            formData.hour_of_day
        );
        onResultsUpdate(results);
        setQueryResults(results);
        setShowResults(true);
        console.log("Congestion Results:" + results);
    };
    // TODO: Maybe define some styles? It took forever to figure out how to make this thing not look stupid
    return (
        <div className="absolute top-4 right-4 w-120 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-[1000]">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="latitude"
                        className="block text-sm font-medium text-gray-700"
                        style={{ display: "inline-block" }}
                    >
                        Latitude
                    </label>
                    <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter latitude"
                    />
                    <label
                        htmlFor="longitude"
                        className="block text-sm font-medium text-gray-700"
                        style={{ display: "inline-block" }}
                    >
                        Longitude
                    </label>
                    <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter longitude"
                    />
                </div>

                <div>
                    <label
                        htmlFor="distance_threshold"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Distance Threshold
                    </label>
                    <input
                        type="text"
                        id="distance_threshold"
                        name="distance_threshold"
                        value={formData.distance_threshold}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Distance to search"
                    />
                </div>

                <div>
                    <label
                        htmlFor="hour_range"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Hour Range
                    </label>
                    <input
                        type="text"
                        id="hour_range"
                        name="hour_range"
                        value={formData.hour_range}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Hour range"
                    />
                </div>

                <div>
                    <label
                        htmlFor="hour_of_day"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Hour of Day
                    </label>
                    <input
                        type="text"
                        id="hour_of_day"
                        name="hour_of_day"
                        value={formData.hour_of_day}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Hour range"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    Submit
                </button>
            </form>

            <QueryResults results={queryResults} />
        </div>
    );
}
