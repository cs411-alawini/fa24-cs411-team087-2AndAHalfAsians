"use client";

// IMPORTANT: the order matters!
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import RoutingMachine from './RoutingMachine';

export default function Map() {
    const position: LatLngExpression = [33.52001088075479, 36.26829385757446];

    return (
        <MapContainer
            center={position}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: "100vh", width: "100vw" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    This Marker icon is displayed correctly with <i>leaflet-defaulticon-compatibility</i>.
                </Popup>
            </Marker>
            <RoutingMachine />
        </MapContainer>
    );
}