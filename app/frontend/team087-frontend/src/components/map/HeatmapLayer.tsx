import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatmapLayerProps {
    points: [number, number, number][];
    radius?: number;
    blur?: number;
    max?: number;
    maxZoom?: number;
    minOpacity?: number;
    gradient?: { [key: number]: string };
}

const HeatmapLayer = ({
    points,
    radius = 25,
    blur = 15,
    max = 1.0,
    maxZoom,
    minOpacity,
    gradient,
}: HeatmapLayerProps) => {
    const map = useMap();

    useEffect(() => {
        const heatLayer = L.heatLayer(points, {
            radius,
            blur,
            max,
            maxZoom,
            minOpacity,
            gradient,
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, radius, blur, max, maxZoom, minOpacity, gradient]);

    return null;
};

export default HeatmapLayer;