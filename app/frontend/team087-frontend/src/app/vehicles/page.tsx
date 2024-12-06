"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Center,
    Modal,
    Table,
    Card,
    Container,
    TextInput,
    Stack,
    Group,
    Title,
    Grid,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ElectricVehicle, OwnedVehicle, NewVehicle } from "@/schemas";
import { fetchOwnedVehicles } from "@/lib/data/User";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    fetchAllVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    addNewVehicle,
    addOwnedVehicle,
    deleteOwnedVehicle,
} from "@/lib/data/Vehicle";
import NewVehicleForm from "@/components/forms/NewVehicleForm";
import OwnedVehicleForm from "@/components/forms/OwnedVehicleForm";

const VehicleFormSchema = ElectricVehicle;

function VehicleForm({
    vehicle,
    onSubmit,
}: {
    vehicle: ElectricVehicle | null;
    onSubmit: (vehicle: ElectricVehicle) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ElectricVehicle>({
        resolver: zodResolver(VehicleFormSchema),
        defaultValues: {
            ev_id: vehicle?.ev_id || 0,
            make: vehicle?.make || "",
            model: vehicle?.model || "",
            plug_type: vehicle?.plug_type || 0,
            range_km: vehicle?.range_km || 0,
            battery_capacity: vehicle?.battery_capacity || 0,
        },
    });

    useEffect(() => {
        reset(
            vehicle || {
                ev_id: 0,
                make: "",
                model: "",
                plug_type: 0,
                range_km: 0,
                battery_capacity: 0,
            }
        );
    }, [vehicle, reset]);

    const onSubmitForm = (data: ElectricVehicle) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)}>
            <Stack>
                <input
                    type="hidden"
                    {...register("ev_id", { valueAsNumber: true })}
                />
                <TextInput
                    label="Make"
                    {...register("make")}
                    error={errors.make?.message}
                />
                <TextInput
                    label="Model"
                    {...register("model")}
                    error={errors.model?.message}
                />
                <TextInput
                    label="Plug Type"
                    type="number"
                    {...register("plug_type", { valueAsNumber: true })}
                    error={errors.plug_type?.message}
                />
                <TextInput
                    label="Range (km)"
                    type="number"
                    {...register("range_km", { valueAsNumber: true })}
                    error={errors.range_km?.message}
                />
                <TextInput
                    label="Battery Capacity (kWh)"
                    type="number"
                    step="any"
                    {...register("battery_capacity", { valueAsNumber: true })}
                    error={errors.battery_capacity?.message}
                />
                <Group justify="flex-end">
                    <Button type="submit">Submit</Button>
                </Group>
            </Stack>
        </form>
    );
}

export default function VehiclesClientPage() {
    const { data: currentUser, isLoading, error } = useCurrentUser();

    const [allVehicles, setAllVehicles] = useState<ElectricVehicle[]>([]);
    const [ownedVehicles, setOwnedVehicles] = useState<ElectricVehicle[]>([]);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingVehicle, setEditingVehicle] =
        useState<ElectricVehicle | null>(null);
    const [isAddingOwnedVehicle, setIsAddingOwnedVehicle] = useState(false);
    const [isAddingNewVehicle, setIsAddingNewVehicle] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchOwnedVehicles(currentUser.user_id.toString()).then(
                setOwnedVehicles
            );
            fetchAllVehicles().then(setAllVehicles);
        }
    }, [currentUser]);

    if (isLoading) {
        return <div>Loading user...</div>;
    }

    if (error) {
        return <div>Error fetching user: {error.message}</div>;
    }

    if (!currentUser) {
        return <div>Please log in to access the vehicles page.</div>;
    }

    const handleCreateOrUpdate = async (vehicle: ElectricVehicle) => {
        if (editingVehicle) {
            const result = await updateVehicle(vehicle);
            notifications.show({
                title: "Success!",
                message: `Successfully updated vehicle with id ${result.ev_id}`,
            });
        } else {
            const result = await createVehicle(vehicle);
            notifications.show({
                title: "Success!",
                message: `Successfully created vehicle with id ${result.ev_id}`,
            });
        }
        setModalOpened(false);
        setEditingVehicle(null);
        fetchAllVehicles().then(setAllVehicles);
        fetchOwnedVehicles(currentUser.user_id.toString()).then(
            setOwnedVehicles
        );
    };

    const handleAddOwnedVehicle = async (ownedVehicle: OwnedVehicle) => {
        await addOwnedVehicle(ownedVehicle);
        setModalOpened(false);
        fetchOwnedVehicles(currentUser.user_id.toString()).then(
            setOwnedVehicles
        );
    };

    const handleAddNewVehicle = async (newVehicle: NewVehicle) => {
        await addNewVehicle(newVehicle);
        setModalOpened(false);
        fetchAllVehicles().then(setAllVehicles);
    };

    const handleDelete = async (vehicleId: number) => {
        await deleteVehicle(vehicleId);
        fetchAllVehicles().then(setAllVehicles);
        fetchOwnedVehicles(currentUser.user_id.toString()).then(
            setOwnedVehicles
        );
    };

    const handleDeleteOwnedVehicle = async (evId: number) => {
        await deleteOwnedVehicle(currentUser.user_id, evId);
        fetchOwnedVehicles(currentUser.user_id.toString()).then(
            setOwnedVehicles
        );
    };

    return (
        <Container size="lg" style={{ marginTop: "2rem", padding: "1rem" }}>
            <Card shadow="sm" padding="lg" radius="md" mb="xs" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                    <Center>
                        <Title order={2}>Owned Vehicles</Title>
                    </Center>
                    <Button
                        fullWidth
                        onClick={() => {
                            setIsAddingOwnedVehicle(true);
                            setIsAddingNewVehicle(false);
                            setModalOpened(true);
                        }}
                    >
                        Add Owned Vehicle
                    </Button>
                </Card.Section>
                <Card.Section inheritPadding py="xs">
                    <Table striped highlightOnHover withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Make</Table.Th>
                                <Table.Th>Model</Table.Th>
                                <Table.Th>Plug Type</Table.Th>
                                <Table.Th>Range (km)</Table.Th>
                                <Table.Th>Battery Capacity (kWh)</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {ownedVehicles.map((vehicle: ElectricVehicle) => (
                                <Table.Tr key={vehicle.ev_id}>
                                    <Table.Td>{vehicle.ev_id}</Table.Td>
                                    <Table.Td>{vehicle.make}</Table.Td>
                                    <Table.Td>{vehicle.model}</Table.Td>
                                    <Table.Td>{vehicle.plug_type}</Table.Td>
                                    <Table.Td>{vehicle.range_km}</Table.Td>
                                    <Table.Td>
                                        {vehicle.battery_capacity}
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            color="red"
                                            onClick={() =>
                                                handleDeleteOwnedVehicle(
                                                    vehicle.ev_id!
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card.Section>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section withBorder inheritPadding py="xs">
                    <Center>
                        <Title order={2}>All Vehicles</Title>
                    </Center>
                    <Button
                        fullWidth
                        onClick={() => {
                            setIsAddingOwnedVehicle(false);
                            setIsAddingNewVehicle(true);
                            setModalOpened(true);
                        }}
                    >
                        Add Vehicle
                    </Button>
                </Card.Section>
                <Card.Section inheritPadding py="xs">
                    <Table striped highlightOnHover withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Make</Table.Th>
                                <Table.Th>Model</Table.Th>
                                <Table.Th>Plug Type</Table.Th>
                                <Table.Th>Range (km)</Table.Th>
                                <Table.Th>Battery Capacity (kWh)</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {allVehicles.map((vehicle: ElectricVehicle) => (
                                <Table.Tr key={vehicle.ev_id}>
                                    <Table.Td>{vehicle.ev_id}</Table.Td>
                                    <Table.Td>{vehicle.make}</Table.Td>
                                    <Table.Td>{vehicle.model}</Table.Td>
                                    <Table.Td>{vehicle.plug_type}</Table.Td>
                                    <Table.Td>{vehicle.range_km}</Table.Td>
                                    <Table.Td>
                                        {vehicle.battery_capacity}
                                    </Table.Td>
                                    <Table.Td>
                                        <Button
                                            onClick={() => {
                                                setEditingVehicle(vehicle);
                                                setIsAddingOwnedVehicle(false);
                                                setIsAddingNewVehicle(false);
                                                setModalOpened(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            color="red"
                                            onClick={() =>
                                                handleDelete(vehicle.ev_id!)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card.Section>
            </Card>

            <Modal
                opened={modalOpened}
                onClose={() => {
                    setModalOpened(false);
                    setEditingVehicle(null);
                }}
                title={
                    editingVehicle
                        ? "Edit Vehicle"
                        : isAddingOwnedVehicle
                          ? "Add Owned Vehicle"
                          : isAddingNewVehicle
                            ? "Add Vehicle"
                            : ""
                }
            >
                {isAddingNewVehicle ? (
                    <NewVehicleForm onSubmit={handleAddNewVehicle} />
                ) : isAddingOwnedVehicle ? (
                    <OwnedVehicleForm onSubmit={handleAddOwnedVehicle} />
                ) : (
                    <VehicleForm
                        vehicle={editingVehicle}
                        onSubmit={handleCreateOrUpdate}
                    />
                )}
            </Modal>
        </Container>
    );
}
