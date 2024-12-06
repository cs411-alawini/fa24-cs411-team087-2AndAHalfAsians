import { useState, useEffect } from "react";
import { Table, TextInput } from "@mantine/core";
import { GetBestElectricVehiclesForTripResults } from "@/interfaces/interfaces";
import Fuse from "fuse.js";
import { useDebouncedValue } from "@mantine/hooks";

interface BestEVsTableProps {
    data: GetBestElectricVehiclesForTripResults[];
}

export default function BestEVsTable({ data }: BestEVsTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);

    const fuse = new Fuse(data, {
        keys: [
            "ev_station_city",
            "make",
            "model",
            "range_km",
            "battery_capacity",
            "time_to_charge_hr",
            "expected_charge_cost_per_hundred_km",
        ],
        threshold: 0.3,
    });

    const results = debouncedSearchTerm
        ? fuse.search(debouncedSearchTerm).map((result) => result.item)
        : data;

    return (
        <>
            <TextInput
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                mb="md"
            />
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>City</Table.Th>
                        <Table.Th>Make</Table.Th>
                        <Table.Th>Model</Table.Th>
                        <Table.Th>Range (km)</Table.Th>
                        <Table.Th>Battery Capacity</Table.Th>
                        <Table.Th>Time to Charge (hrs)</Table.Th>
                        <Table.Th>Expected Charge Cost per 100 km</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {results.map((ev, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>{ev.ev_station_city}</Table.Td>
                            <Table.Td>{ev.make}</Table.Td>
                            <Table.Td>{ev.model}</Table.Td>
                            <Table.Td>{ev.range_km}</Table.Td>
                            <Table.Td>{ev.battery_capacity}</Table.Td>
                            <Table.Td>{ev.time_to_charge_hr}</Table.Td>
                            <Table.Td>
                                {ev.expected_charge_cost_per_hundred_km}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    );
}
