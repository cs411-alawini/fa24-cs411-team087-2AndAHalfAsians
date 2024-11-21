import { CompatibleEVStation, ElectricVehicle } from '@/interfaces/interfaces';
import React from 'react';

// TODO: Refactor this with generics so we don't have to keep adding types here
interface QueryResultsProps {
  results: CompatibleEVStation[] | ElectricVehicle[] | null;
  isVisible: boolean;
}

const QueryResults = ({ results, isVisible }: QueryResultsProps) => {
  if (!isVisible || !results) return null;

  const resultsArray = Array.isArray(results) ? results : [results];

  return (
    <div className="fixed bottom-4 left-4 min-w-[450px] max-w-[600px] max-h-2xl bg-white bg-opacity-95 p-4 rounded-lg shadow-lg z-[1000]">
        <div className="flex mt-0 justify-between items-center mb-4">
            <h2 className="text-lg"><b>Query Results</b></h2>
            <span className="text-sm text-gray-500">
                {resultsArray.length} {resultsArray.length === 1 ? 'result' : 'results'}
            </span>
        </div>

        <div className="overflow-auto max-h-80 font-mono text-sm">
            {resultsArray.map((item, index) => (
            <div 
                key={index}
                className="mb-2 p-2 m-2 bg-gray-50 rounded border border-gray-400">
                <pre>
                    {JSON.stringify(item, null, 2)}
                </pre>
            </div>
            ))}
        </div>
    </div>
  );
};

export default QueryResults;