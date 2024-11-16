'use client';

import dynamic from 'next/dynamic';
import { JSX } from 'react';

const LazyMap = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

function MapCaller(props: JSX.IntrinsicAttributes) {
    return <LazyMap {...props} />;
}

export default MapCaller;