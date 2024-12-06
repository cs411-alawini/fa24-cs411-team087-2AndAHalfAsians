"use client";

// import { useState } from "react";
import {
    //TextInput,
    // Button,
    // Box,
    // Text,
    Table,
} from "@mantine/core";
import { ElectricVehicle } from "@/schemas";

interface VehiclesClientPageProps {
    vehicles: ElectricVehicle[];
}

export default function VehiclesClientPage({
    vehicles,
}: VehiclesClientPageProps) {
    // const [keywordSearch, setKeywordSearch] = useState("");

    const filteredVehicles = vehicles.map((vehicles) => {
        return vehicles;
    });

    return (
        <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Make</Table.Th>
                    <Table.Th>Model</Table.Th>
                    <Table.Th>Plug Type</Table.Th>
                    <Table.Th>Range (km)</Table.Th>
                    <Table.Th>Battery Capacity (kWh)</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {filteredVehicles.map((vehicle: ElectricVehicle) => (
                    <Table.Tr key={vehicle.ev_id}>
                        <Table.Td>{vehicle.ev_id}</Table.Td>
                        <Table.Td>{vehicle.make}</Table.Td>
                        <Table.Td>{vehicle.model}</Table.Td>
                        <Table.Td>{vehicle.plug_type}</Table.Td>
                        <Table.Td>{vehicle.range_km}</Table.Td>
                        <Table.Td>{vehicle.battery_capacity}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}

// function VehiclesClientPage2({ initialVehicles }: VehicleClientPageProps) {
//     const [keyword, setKeyword] = useState("");
//     const [results, setResults] = useState<ElectricVehicle[]>(initialVehicles);

//     const handleSearch = (event: React.FormEvent) => {
//         event.preventDefault();
//         const filteredResults = initialVehicles.filter((vehicle) =>
//             vehicle.toLowerCase().includes(keyword.toLowerCase())
//         );
//         setResults(filteredResults);
//     };

//     return (
//         <Box style={{ maxWidth: 600, margin: "auto", padding: "20px" }}>
//             <Text ta="center" size="xl" fw={700}>
//                 Vehicle Search
//             </Text>
//             <form onSubmit={handleSearch}>
//                 <TextInput
//                     label="Search for Vehicles"
//                     placeholder="Enter keyword (e.g., Tesla, SUV)"
//                     value={keyword}
//                     onChange={(e) => setKeyword(e.currentTarget.value)}
//                     required
//                 />
//                 <Button type="submit" fullWidth mt="md">
//                     Search
//                 </Button>
//             </form>
//             <Box mt="xl">
//                 {results.length > 0 ? (
//                     <ul>
//                         {results.map((result, index) => (
//                             <li key={index}>
//                                 <Text>{result}</Text>
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <Text ta="center" c="dimmed">
//                         No results found. Try another keyword.
//                     </Text>
//                 )}
//             </Box>
//         </Box>
//     );
// }
