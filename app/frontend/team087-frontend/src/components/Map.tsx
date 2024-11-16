"use client";

// IMPORTANT: the order matters!
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
// import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
// import RoutingMachine from './RoutingMachine';

export default function Map(props: any) {
    // Center position near the center of the contiguous United States
    const position: LatLngExpression = [39.8283, -98.5795];

    return (
        <MapContainer
            center={position}
            zoom={5}  // Set zoom level to show most of the U.S.
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* <Marker position={position}>
                <Popup>
                    This Marker icon is displayed correctly with <i>leaflet-defaulticon-compatibility</i>.
                </Popup>
            </Marker> */}
            {/* <RoutingMachine /> */}
        </MapContainer>
    );
}
