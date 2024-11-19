'use client';

import { CompatibleEVStation } from '@/interfaces/interfaces';
import dynamic from 'next/dynamic';
// import { JSX } from 'react';

interface MapCallerProps {
    props: CompatibleEVStation[];
}

const LazyMap = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function MapCaller({ props }: MapCallerProps) {
    return <LazyMap props={props} />;
}

export default MapCaller;