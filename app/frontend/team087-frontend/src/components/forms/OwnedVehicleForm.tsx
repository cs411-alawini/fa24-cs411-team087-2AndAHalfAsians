import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OwnedVehicle, OwnedVehicleSchema } from "@/schemas";
import { Button, Stack, TextInput } from "@mantine/core";

interface OwnedVehicleFormProps {
    onSubmit: (ownedVehicle: OwnedVehicle) => void;
}

export default function OwnedVehicleForm({ onSubmit }: OwnedVehicleFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OwnedVehicle>({
        resolver: zodResolver(OwnedVehicleSchema),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
                <TextInput
                    label="User ID"
                    type="number"
                    {...register("user_id", { valueAsNumber: true })}
                    error={errors.user_id?.message}
                />
                <TextInput
                    label="EV ID"
                    type="number"
                    {...register("ev_id", { valueAsNumber: true })}
                    error={errors.ev_id?.message}
                />
                <Button type="submit">Submit</Button>
            </Stack>
        </form>
    );
}
