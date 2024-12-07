"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Button, Box, Group, Paper, Divider, TextInput } from "@mantine/core";
import CRUDDropdownList from "@/components/old_map/CRUDDropdownList";
import { executeOwnsEVQuery } from "@/interfaces/interfaces";
import { ElectricVehicle } from "@/interfaces/interfaces";
import QueryResults from "./QueryResults";

export default function OwnsEVForm() {
    // Form data state
    const [formData, setFormData] = useState({
        user_id: "",
        previous_ev_id: "",
        new_ev_id: "",
        ev_id: "",
    });

    const [currentSelection, onSelectionChange] = useState("READ");
    const [queryResults, setQueryResults] = useState<ElectricVehicle[] | null>(
        null
    );

    // Update form data based on input change
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const results = await executeOwnsEVQuery(
            currentSelection,
            formData.user_id,
            formData.ev_id,
            formData.previous_ev_id,
            formData.new_ev_id
        );
        setQueryResults(results); // Set query results for the QueryResults component
    };

    // Render form fields based on the selected operation
    const renderForm = () => {
        switch (currentSelection) {
            case "CREATE":
                return (
                    <>
                        <TextInput
                            label="User ID"
                            placeholder="Enter User ID"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            required
                        />
                        <TextInput
                            label="EV ID to add to User"
                            placeholder="Enter EV ID"
                            name="ev_id"
                            value={formData.ev_id}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                );
            case "READ":
                return (
                    <TextInput
                        label="User ID"
                        placeholder="Enter User ID"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        required
                    />
                );
            case "UPDATE":
                return (
                    <>
                        <TextInput
                            label="User ID"
                            placeholder="Enter User ID"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            required
                        />
                        <TextInput
                            label="Owned EV ID to Update"
                            placeholder="Enter Owned EV ID"
                            name="previous_ev_id"
                            value={formData.previous_ev_id}
                            onChange={handleInputChange}
                            required
                        />
                        <TextInput
                            label="New value for EV ID"
                            placeholder="Enter New EV ID"
                            name="new_ev_id"
                            value={formData.new_ev_id}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                );
            case "DELETE":
                return (
                    <>
                        <TextInput
                            label="User ID"
                            placeholder="Enter User ID"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            required
                        />
                        <TextInput
                            label="EV ID to delete from User"
                            placeholder="Enter EV ID"
                            name="ev_id"
                            value={formData.ev_id}
                            onChange={handleInputChange}
                            required
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            {/* Form Section */}
            <Paper
                withBorder
                shadow="sm"
                p="lg"
                radius="md"
                style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    zIndex: 1000,
                    background: "white",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <CRUDDropdownList
                        currentSelection={currentSelection}
                        onSelectionChange={onSelectionChange}
                    />
                    <Divider my="sm" />
                    {renderForm()}
                    <Group justify="center" mt="md">
                        <Button type="submit" variant="filled" color="blue">
                            Submit
                        </Button>
                    </Group>
                </form>
            </Paper>

            {/* Query Results Section */}
            <QueryResults results={queryResults} />
        </Box>
    );
}
