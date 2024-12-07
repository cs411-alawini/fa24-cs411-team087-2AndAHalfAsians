import { Table } from "@mantine/core";
import {
    GetPlugInstanceStatsResults,
    GetPlugTypeResults,
} from "@/interfaces/interfaces";
import { useEffect, useState } from "react";
import { getPlugType } from "@/lib/data/EVStation";

interface PlugInstanceStatsTableProps {
    data: GetPlugInstanceStatsResults[];
}

export default function PlugInstanceStatsTable({
    data,
}: PlugInstanceStatsTableProps) {
    const [plugTypes, setPlugTypes] = useState<GetPlugTypeResults[]>([]);

    useEffect(() => {
        const fetchPlugTypes = async () => {
            const types = await Promise.all(
                data.map(async (item) => {
                    const result = await getPlugType({ type_id: item.type_id });
                    return result;
                })
            );
            setPlugTypes(types);
        };

        fetchPlugTypes();
    }, [data]);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Plug Type</Table.Th>
                    <Table.Th>Type Count</Table.Th>
                    <Table.Th>Average Base Price</Table.Th>
                    <Table.Th>Average Usage Price</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data.map((item, index) => (
                    <Table.Tr key={index}>
                        <Table.Td>
                            {plugTypes.find(
                                (type) => type.type_id === item.type_id
                            )?.type_name || "Loading..."}
                        </Table.Td>
                        <Table.Td>{item.type_count}</Table.Td>
                        <Table.Td>${item.avg_base_price.toFixed(2)}</Table.Td>
                        <Table.Td>${item.avg_useage_price.toFixed(2)}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}
