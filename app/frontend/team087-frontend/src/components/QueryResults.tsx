"use client";

import React from "react";
import { CompatibleEVStation, ElectricVehicle } from "@/interfaces/interfaces";
import { Modal, Box, ScrollArea, Text, Divider, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface QueryResultsProps {
    results: CompatibleEVStation[] | ElectricVehicle[] | null;
}

const QueryResults = ({ results }: QueryResultsProps) => {
    const [opened, { open, close }] = useDisclosure(false);

    if (!results) return null;

    const resultsArray = Array.isArray(results) ? results : [results];

    return (
        <>
            {/* Trigger Button */}
            <Button
                onClick={open}
                variant="outline"
                style={{ marginBottom: 16 }}
            >
                Show Query Results
            </Button>

            {/* Results Modal */}
            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Text fw={700} size="lg">
                        Query Results
                    </Text>
                }
                size="lg"
                centered
            >
                <Box>
                    <Text size="sm" c="dimmed" ta="right">
                        {resultsArray.length}{" "}
                        {resultsArray.length === 1 ? "result" : "results"}
                    </Text>
                </Box>

                <Divider my="sm" />

                <ScrollArea style={{ maxHeight: 400 }}>
                    {resultsArray.map((item, index) => (
                        <Box
                            key={index}
                            style={{
                                marginBottom: "0.75rem",
                                padding: "1rem",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                            }}
                        >
                            <pre
                                style={{
                                    fontFamily: "monospace",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {JSON.stringify(item, null, 2)}
                            </pre>
                        </Box>
                    ))}
                </ScrollArea>
            </Modal>
        </>
    );
};

export default QueryResults;
