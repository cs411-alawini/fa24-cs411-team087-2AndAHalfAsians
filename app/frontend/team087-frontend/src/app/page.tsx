'use client'

// I guess GCR doesn't let us build if we don't use an import
// import dynamic from "next/dynamic";
// import Image from "next/image";
import { useState } from "react";
import MapCaller from "@/components/MapCaller";
import TestText from "@/components/TestText";
import { CompatibleEVStation } from "@/interfaces/interfaces";


export default function Home() {
  const [stations, setStations] = useState<CompatibleEVStation[]>([]);

  return (
    <main className="relative">
      <MapCaller props={stations} />
      <TestText onResultsUpdate={setStations}/>
    </main>
  );
}
