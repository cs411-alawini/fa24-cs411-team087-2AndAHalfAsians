import React, { ChangeEvent } from "react"; // Importing Modules

interface DropDownSelectorProps {
    onSelectionChange: (selection: string) => void;
    currentSelection: string;
}

// Take input props as arguments that define
function DropdownList({
    onSelectionChange,
    currentSelection,
}: DropDownSelectorProps) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onSelectionChange(event.target.value);
    };

    return (
        <div className="absolute top-4 left-4 w-120 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-[1000]">
            <select value={currentSelection} onChange={handleChange}>
                <option value="CompatibleStationsForm">
                    Compatible Stations
                </option>
                <option value="OwnsEVForm">Electric Vehicle Ownership</option>
            </select>
        </div>
    );
}

export default DropdownList;
