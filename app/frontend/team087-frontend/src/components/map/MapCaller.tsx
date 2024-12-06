"use client";

import { CompatibleEVStation } from "@/interfaces/interfaces";
import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("@/components/map/Map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function MapCaller({ children }: { children: React.ReactNode }) {
    return <LazyMap children={children} />;
}

export default MapCaller;
