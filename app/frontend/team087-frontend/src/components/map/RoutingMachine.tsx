// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

interface RoutingMachineProps {
    waypoints: L.LatLng[];
    onCreateRoute: (e: unknown) => void;
}

const RoutingMachine = ({ waypoints }: RoutingMachineProps) => {
    const map = useMap();

    useEffect(() => {
        const routingControl = L.Routing.control({
            waypoints: waypoints,
            lineOptions: {
                styles: [{ color: "#6FA1EC", weight: 4 }],
                extendToWaypoints: false,
                missingRouteTolerance: 10,
            },
            showAlternatives: false,
            fitSelectedRoutes: false,
            createMarker: () => null,
        }).addTo(map);

        const routingControlContainer = routingControl.getContainer();
        const controlContainerParent = routingControlContainer.parentNode;
        controlContainerParent.removeChild(routingControlContainer);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, waypoints]);

    return null;
};

export default RoutingMachine;
