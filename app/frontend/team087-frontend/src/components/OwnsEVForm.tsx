'use client' // Add this to fix errors

import { useState, ChangeEvent, FormEvent } from 'react';
import CRUDDropdownList from '@/components/CRUDDropdownList';
import { executeOwnsEVQuery } from '@/interfaces/interfaces';
import { ElectricVehicle } from '@/interfaces/interfaces';
import QueryResults from './QueryResults';

// Add our function here which will be sent to the parent
export default function OwnsEVForm() {
    // Set the schema for the frontend form
    const [formData, setFormData] = useState({
        user_id: '',
        previous_ev_id: '',
        new_ev_id: '',
        ev_id: ''
    });

    const [currentSelection, onSelectionChange] = useState('READ')
    const [queryResults, setQueryResults] = useState<ElectricVehicle[] | null>(null);
    const [showResults, setShowResults] = useState(false);

    // Update all fields as needed
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle form submission by getting the results through the getCompatibleStations function to properly cast the results for TS
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Execute form change here
        const results = await executeOwnsEVQuery(
            currentSelection, 
            formData.user_id, 
            formData.ev_id, 
            formData.previous_ev_id, 
            formData.new_ev_id
        );
        // Place results in QueryResults component
        setQueryResults(results);
        setShowResults(true);
    };


    const renderForm = () => {
        switch(currentSelection) {
            case "CREATE":
                return (
                <div className="items-center gap-4">
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        User ID
                    </label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter User ID"
                    />

                    <label htmlFor="ev_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        EV ID to add to User
                    </label>
                    <input
                        type="text"
                        id="ev_id"
                        name="ev_id"
                        value={formData.ev_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter EV ID to add"
                    />
                </div>
                )
            case "READ":
                return (
                <div className="items-center gap-4">
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        User ID
                    </label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter User ID"
                    />
                </div>
                )
            case "UPDATE":
                return (
                <div className="items-center gap-4">
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        User ID
                    </label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter User ID"
                    />

                    <label htmlFor="previous_ev_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        Owned EV ID to Update
                    </label>
                    <input
                        type="text"
                        id="previous_ev_id"
                        name="previous_ev_id"
                        value={formData.previous_ev_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter Owned EV ID to Update"
                    />

                    <label htmlFor="new_ev_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        New value for EV ID
                    </label>
                    <input
                        type="text"
                        id="new_ev_id"
                        name="new_ev_id"
                        value={formData.new_ev_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter New EV ID"
                    />
                </div>
                )
            case "DELETE":
                return (
                <div className="items-center gap-4">
                    <label htmlFor="user_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        User ID
                    </label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter User ID"
                    />

                    <label htmlFor="ev_id" className="block text-sm font-medium text-gray-700" style={{display: 'inline-block'}}>
                        EV ID to delete from User
                    </label>
                    <input
                        type="text"
                        id="ev_id"
                        name="ev_id"
                        value={formData.ev_id}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                        placeholder="Enter EV ID to delete"
                    />
                </div>                
                )
            default:
                return null;
        }
    }

    return (
        <div>
            <div className="absolute flex top-4 right-4 w-150 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-[1000]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <CRUDDropdownList 
                        currentSelection={currentSelection}
                        onSelectionChange={onSelectionChange}/>
                    {renderForm()}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </form>
            </div>

        
        <QueryResults
            results={queryResults}
            isVisible={showResults} />
    </div>
    );
}