"use client"; // Fix errors again

// IMPORTANT: the order matters!
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
// import * as L from 'leaflet';
import "leaflet-defaulticon-compatibility";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { CompatibleEVStation, CongestionScore } from "@/interfaces/interfaces";
// import RoutingMachine from './RoutingMachine';

interface MapProps {
    props: CompatibleEVStation[];
    props1: CongestionScore[];
}

export default function Map({ props, props1 }: MapProps) {
    // Center position near the center of the contiguous United States
    const position: LatLngExpression = [39.8283, -98.5795];
    console.log("Props:", props);
    console.log("Props1:", props1);
    return (
        <MapContainer
            center={position}
            zoom={5} // Set zoom level to show most of the U.S.
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {props.map((station: CompatibleEVStation, index: number) => (
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
                        <div>
                            <b>
                                <h1>{station.name}</h1>
                            </b>
                            <h3>{station.address}</h3>
                            <h3>
                                {station.city} {station.state} {station.zip}
                            </h3>
                            <h3>
                                {station.phone
                                    ? station.phone
                                    : "No contact info"}
                            </h3>
                            <h3>
                                {"$" +
                                    station.base_price +
                                    " to start charging process"}
                            </h3>
                            <h3>{"$" + station.usage_price + "/kwh"}</h3>
                            <h3>
                                {"Estimated charge cost: $" +
                                    station.price_to_charge}
                            </h3>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {props1.map((station: CongestionScore, index: number) => (
                <Marker
                    key={index}
                    position={
                        [
                            // 35.040539,
                            // -118.271387,
                            // TODO: Update the coordinates to the actual coordinates based on when the data is available
                            station.latitude,
                            station.longitude,
                        ] as LatLngExpression
                    }
                >
                    <Popup>
                        <div>
                            <b>
                                <h1>{station.ev_station_id}</h1>
                            </b>
                            <h3>{station.ev_state_code}</h3>
                            <h3>{"Distance: " + station.distance_km + " km"}</h3>
                            <h3>{"Average Volume: " + station.avg_volume}</h3>
                            <h3>
                                {"Congestion Score: " + station.CongestionScore}
                            </h3>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {/* <RoutingMachine /> */}
        </MapContainer>
    );
}
