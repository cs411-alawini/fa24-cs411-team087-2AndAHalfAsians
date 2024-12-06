import { CompatibleEVStation } from "@/interfaces/interfaces";
import { Title, Text, NumberFormatter } from "@mantine/core";
import { LatLngExpression } from "leaflet";
import { Marker, Popup } from "react-leaflet";

export function EVStationMarkers({
    stations,
}: {
    stations: CompatibleEVStation[];
}) {
    return (
        <>
            {stations.map((station, index) => (
                <Marker
                    key={index}
                    position={
                        [
                            station.latitude,
                            station.longitude,
                        ] as LatLngExpression
                    }
                >
                    <Popup>
                        <Title order={5}>{station.name}</Title>
                        <Text size="xs" c="dimmed" mt="xs">
                            {station.address}, {station.city}, {station.state}{" "}
                            {station.zip}
                        </Text>
                        <Text size="xs" mt="xs">
                            <b>Phone:</b> {station.phone || "N/A"}
                        </Text>
                        <Text size="xs" mt="xs">
                            <b>Base Price:</b>{" "}
                            <NumberFormatter
                                prefix="$"
                                value={station.base_price}
                                thousandSeparator
                            />
                        </Text>
                        <Text size="xs" mt="xs">
                            <b>Usage Price:</b>{" "}
                            <NumberFormatter
                                prefix="$"
                                value={station.usage_price}
                                decimalScale={2}
                            />
                            /kWh
                        </Text>
                        <Text size="xs" mt="xs">
                            <b>Estimate:</b>{" "}
                            <NumberFormatter
                                prefix="$"
                                value={station.price_to_charge}
                                thousandSeparator
                                decimalScale={2}
                            />
                        </Text>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}
