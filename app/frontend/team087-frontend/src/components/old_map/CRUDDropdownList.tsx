import { ChangeEvent } from "react";

// Define how we pass out the collected results to be displayed on the map
interface CRUDDropdownValueProp {
    onSelectionChange: (selection: string) => void;
    currentSelection: string;
}

function CRUDDropdownList({
    onSelectionChange,
    currentSelection,
}: CRUDDropdownValueProp) {
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onSelectionChange(event.target.value);
    };

    return (
        <select value={currentSelection} onChange={handleChange}>
            <option value="READ">Read</option>
            <option value="UPDATE">Update</option>
            <option value="CREATE">Create</option>
            <option value="DELETE">Delete</option>
        </select>
    );
}

export default CRUDDropdownList;
