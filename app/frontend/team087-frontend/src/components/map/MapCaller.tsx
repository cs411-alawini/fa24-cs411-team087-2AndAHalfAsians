"use client";

import dynamic from "next/dynamic";

const LazyMap = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function MapCaller({ children }: { children: React.ReactNode }) {
    return <LazyMap>{children}</LazyMap>;
}

export default MapCaller;
