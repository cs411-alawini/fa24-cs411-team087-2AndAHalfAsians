"use client";

import { useState } from "react";
import { useUser } from "@/providers/UserProvider";
import MapCaller from "@/components/MapCaller";
import CompatibleStationsForm from "@/components/CompatibleStationsForm";
import { CompatibleEVStation, CongestionScore } from "@/interfaces/interfaces";
import DropdownList from "@/components/DropDownSelector";
import OwnsEVForm from "@/components/OwnsEVForm";
import CurrentUser from "@/components/common/CurrentUser";
import CongestionScoreForm from "@/components/CongestionScoreForm";
// import UserModal from "@/components/common/UserModal";

export default function MapPage() {
    const { userId } = useUser(); // Access userId from UserProvider
    const [stations, setStations] = useState<CompatibleEVStation[]>([]);
    const [stations1, setStations1] = useState<CongestionScore[]>([]);
    const [currentSelection, onSelectionChange] = useState(
        "CompatibleStationsForm"
    );

    const renderForm = () => {
        switch (currentSelection) {
            case "CompatibleStationsForm":
                return <CompatibleStationsForm onResultsUpdate={setStations} />;
            case "CongestionScoreForm":
                return <CongestionScoreForm onResultsUpdate={setStations1}/>;
            case "OwnsEVForm":
                return <OwnsEVForm />;
            default:
                return null;
        }
    };

    // If no user is logged in, render the UserModal and hide the page content
    if (!userId) {
        return null;
    }

    // Render the page content after the user is logged in
    return (
        <main>
            <MapCaller props={stations} props1={stations1}/>

            <div className="absolute top-1 left-10">
                <DropdownList
                    currentSelection={currentSelection}
                    onSelectionChange={onSelectionChange}
                />
            </div>

            {/* Display the current logged-in user */}
            <CurrentUser />

            {renderForm()}
        </main>
    );
}
