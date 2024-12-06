import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewVehicle, NewVehicleSchema } from "@/schemas";
import { Button, Stack, TextInput } from "@mantine/core";

interface NewVehicleFormProps {
    onSubmit: (vehicle: NewVehicle) => void;
}

export default function NewVehicleForm({ onSubmit }: NewVehicleFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewVehicle>({
        resolver: zodResolver(NewVehicleSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
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
                    {...register("plug_type", {
                        valueAsNumber: true,
                    })}
                    error={errors.plug_type?.message}
                />
                <TextInput
                    label="Range (km)"
                    type="number"
                    {...register("range_km", {
                        valueAsNumber: true,
                    })}
                    error={errors.range_km?.message}
                />
                <TextInput
                    label="Battery Capacity (kWh)"
                    type="number"
                    step="any"
                    {...register("battery_capacity", {
                        valueAsNumber: true,
                    })}
                    error={errors.battery_capacity?.message}
                />
                <Button type="submit">Submit</Button>
            </Stack>
        </form>
    );
}
