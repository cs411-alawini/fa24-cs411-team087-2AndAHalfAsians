"use client";

import { CompatibleEVStation, CongestionScore } from "@/interfaces/interfaces";
import dynamic from "next/dynamic";
// import { JSX } from 'react';

interface MapCallerProps {
    props: CompatibleEVStation[];
    props1: CongestionScore[];
}

const LazyMap = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function MapCaller({ props, props1 }: MapCallerProps) {
    // TODO: update the way that props are passed to the map, a little jank right now?
    return <LazyMap props={props} props1={props1} />;
}

export default MapCaller;
