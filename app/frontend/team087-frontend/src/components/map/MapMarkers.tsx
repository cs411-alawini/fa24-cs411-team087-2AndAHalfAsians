import { CompatibleEVStation } from "@/interfaces/interfaces";
import { Title, Text, NumberFormatter, Table } from "@mantine/core";
import { LatLngExpression } from "leaflet";
import { Marker, Popup } from "react-leaflet";

function preprocessStations(stations: CompatibleEVStation[]) {
    const combinedStations: { [key: string]: CompatibleEVStation[] } = {};

    stations.forEach((station) => {
        const key = `${station.latitude},${station.longitude}`;
        if (!combinedStations[key]) {
            combinedStations[key] = [];
        }
        combinedStations[key].push(station);
    });

    return Object.values(combinedStations);
}

function interpolateColor(color1: number[], color2: number[], factor: number) {
    return color1.map((c, i) => Math.round(c + factor * (color2[i] - c)));
}

function generateGradient(
    numColors: number,
    color1: number[],
    color2: number[]
) {
    if (numColors === 1) {
        return [`rgb(${color1.join(",")})`];
    }

    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const factor = i / (numColors - 1);
        const interpolatedColor = interpolateColor(color1, color2, factor);
        colors.push(`rgb(${interpolatedColor.join(",")})`);
    }
    return colors;
}

export function EVStationMarkers({
    stations,
}: {
    stations: CompatibleEVStation[];
}) {
    const combinedStations = preprocessStations(stations);

    return (
        <>
            {combinedStations.map((stationGroup, index) => {
                const { latitude, longitude } = stationGroup[0];
                const sortedStations = stationGroup.sort((a, b) => {
                    if (a.in_use === b.in_use) {
                        return a.price_to_charge - b.price_to_charge;
                    }
                    return a.in_use ? 1 : -1;
                });

                const greenGradient = generateGradient(
                    sortedStations.length,
                    [102, 158, 100], // Light green
                    [43, 53, 42] // Dark green
                );

                const redGradient = generateGradient(
                    sortedStations.length,
                    [220, 70, 70], // Light red
                    [95, 44, 44] // Dark red
                );

                return (
                    <Marker
                        key={index}
                        position={[latitude, longitude] as LatLngExpression}
                    >
                        <Popup>
                            <Title order={5}>{stationGroup[0].name}</Title>
                            <Text size="xs" c="dimmed" mt="xs">
                                {stationGroup[0].address},{" "}
                                {stationGroup[0].city}, {stationGroup[0].state}{" "}
                                {stationGroup[0].zip}
                            </Text>
                            <Text size="xs" mt="xs">
                                <b>Phone:</b> {stationGroup[0].phone || "N/A"}
                            </Text>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Base Price</Table.Th>
                                        <Table.Th>Usage Price</Table.Th>
                                        <Table.Th>Estimate</Table.Th>
                                        <Table.Th>
                                            Time to Charge (hrs)
                                        </Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {sortedStations.map((station, idx) => {
                                        const backgroundColor = station.in_use
                                            ? redGradient[idx]
                                            : greenGradient[idx];
                                        return (
                                            <Table.Tr
                                                key={idx}
                                                style={{
                                                    backgroundColor,
                                                    color: "#fff", // Always use white text for better contrast
                                                    textShadow:
                                                        "1px 1px 2px rgba(0, 0, 0, 0.5)", // Add text shadow for better readability
                                                }}
                                            >
                                                <Table.Td>
                                                    $
                                                    {station.base_price.toFixed(
                                                        2
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    $
                                                    {station.usage_price.toFixed(
                                                        2
                                                    )}
                                                    /kWh
                                                </Table.Td>
                                                <Table.Td>
                                                    $
                                                    {station.price_to_charge.toFixed(
                                                        2
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    {station.time_to_charge_hr.toFixed(
                                                        2
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}
