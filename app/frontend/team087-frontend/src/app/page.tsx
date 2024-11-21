'use client'

// I guess GCR doesn't let us build if we don't use an import
// import dynamic from "next/dynamic";
// import Image from "next/image";
import { useState } from "react";
import MapCaller from "@/components/MapCaller";
import CompatibleStationsForm from "@/components/CompatibleStationsForm";
import { CompatibleEVStation } from "@/interfaces/interfaces";
import DropdownList from "@/components/DropDownSelector";
import OwnsEVForm from "@/components/OwnsEVForm";


export default function Home() {
  const [stations, setStations] = useState<CompatibleEVStation[]>([]);
  const [currentSelection, onSelectionChange] = useState('CompatibleStationsForm')

  const renderForm = () => {
    switch (currentSelection) {
      case "CompatibleStationsForm":
        return <CompatibleStationsForm onResultsUpdate={setStations}/>;
      case "OwnsEVForm":
        return <OwnsEVForm />;
      default:
        return null;
    }
  }


  return (
    <main className="relative">
      <MapCaller props={stations} />
      <div className="absolute top-1 left-10">
        <DropdownList 
          currentSelection={currentSelection}
          onSelectionChange={onSelectionChange}/>
      </div>

      {renderForm()}
    </main>
  );
}
