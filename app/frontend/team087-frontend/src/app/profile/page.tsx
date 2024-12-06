"use client";

// import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    TextInput,
    Group,
    Title,
    Container,
    // Notification,
} from "@mantine/core";
import { BASE_URL } from "@/lib/query";
import { useUser, fetchUser } from "@/providers/UserProvider";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import md5 from "md5";

const EditProfileSchema = z.object({
    username: z
        .string()
        .optional()
        .refine((val) => !val || (val.length >= 1 && val.length <= 100), {
            message:
                "Username must be between 1 and 100 characters when provided.",
        }),
    email: z
        .string()
        .optional()
        .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: "Invalid email format.",
        }),
    password: z.string().optional(),
    ssn: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{3}-\d{2}-\d{4}$/.test(val), {
            message: "SSN must follow the format XXX-XX-XXXX.",
        }),
    address: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 100, {
            message: "Address must not exceed 100 characters.",
        }),
    state: z
        .string()
        .optional()
        .refine((val) => !val || val.length === 2, {
            message: "State must be 2 characters when provided.",
        }),
    city: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 100, {
            message: "City must not exceed 100 characters.",
        }),
    zip: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 10, {
            message: "Zip must not exceed 10 characters.",
        }),
    first_name: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 100, {
            message: "First name must not exceed 100 characters.",
        }),
    last_name: z
        .string()
        .optional()
        .refine((val) => !val || val.length <= 100, {
            message: "Last name must not exceed 100 characters.",
        }),
    middle_initial: z
        .string()
        .optional()
        .refine((val) => !val || val.length === 1, {
            message: "Middle initial must be 1 character when provided.",
        }),
});

type EditProfileForm = z.infer<typeof EditProfileSchema>;

export default function ProfilePage() {
    const queryClient = useQueryClient();

    const { userId } = useUser(); // Replace this with a dynamic userId when available

    // Fetch user data using React Query
    const {
        data: user,
        isLoading: isUserLoading,
        error: userError,
        refetch,
    } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUser(userId!),
        enabled: !!userId,
    });

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EditProfileForm>({
        resolver: zodResolver(EditProfileSchema),
    });

    // Mutation for updating user profile
    const mutation = useMutation({
        mutationFn: (updatedData: EditProfileForm) => {
            if (!user) {
                throw new Error("User data is not available.");
            }

            // Hash the password if it's present in cleanedData
            if (updatedData.password) {
                updatedData.password = md5(updatedData.password);
            }

            // Create a payload where empty fields are replaced with undefined
            const cleanedData = Object.entries(updatedData).reduce(
                (acc, [key, value]) => {
                    acc[key as keyof EditProfileForm] =
                        value === "" || value === null ? undefined : value;
                    return acc;
                },
                {} as EditProfileForm
            );

            // Add all keys from user to cleanedData
            for (const key in user) {
                if (!(key in cleanedData)) {
                    cleanedData[key as keyof EditProfileForm] =
                        user[key as keyof EditProfileForm];
                } else if (
                    cleanedData[key as keyof EditProfileForm] === undefined
                ) {
                    cleanedData[key as keyof EditProfileForm] =
                        user[key as keyof EditProfileForm];
                }
            }

            return fetch(
                `${BASE_URL}/User/UpdateUser/?${new URLSearchParams(cleanedData as Record<string, string>).toString()}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json", // This may no longer be necessary since you're not sending JSON in the body
                    },
                }
            );
        },
        onSuccess: () => {
            queryClient
                .invalidateQueries({ queryKey: ["user", userId] })
                .then(() => {
                    refetch();
                    reset();
                });
            notifications.show({
                title: "Completed",
                message: "Profile updated successfully.",
            });
        },
        onError: (error) => {
            console.error("Error updating profile:", error);
            notifications.show({
                title: "Error",
                message: "Failed to update profile.",
                color: "red",
            });
        },
    });

    // Form submission
    const onSubmit: SubmitHandler<EditProfileForm> = (data) => {
        mutation.mutate(data);
    };

    // Handle loading and error states
    if (isUserLoading) {
        return (
            <Container>
                <Title>Loading...</Title>
            </Container>
        );
    }

    if (userError) {
        notifications.show({
            title: "Error Loading User Data",
            message: `{userError.toString()}`,
            color: "red",
        });
        return (
            <Container>
                <Title>Error</Title>
            </Container>
        );
    }

    return (
        <Container>
            <Title order={2} mb="md">
                Edit Profile
            </Title>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextInput
                    label="User ID"
                    value={user?.user_id || ""}
                    disabled
                    mb="sm"
                />
                <TextInput
                    label="Username"
                    placeholder={user?.username || ""}
                    {...register("username")}
                    error={errors.username?.message}
                    mb="sm"
                />
                <TextInput
                    label="Email"
                    placeholder={user?.email || ""}
                    {...register("email")}
                    error={errors.email?.message}
                    mb="sm"
                />
                <TextInput
                    label="Password"
                    type="password"
                    placeholder="Leave blank to keep current password"
                    {...register("password")}
                    error={errors.password?.message}
                    mb="sm"
                />
                <TextInput
                    label="SSN"
                    placeholder={user?.ssn || ""}
                    {...register("ssn")}
                    error={errors.ssn?.message}
                    mb="sm"
                />
                <TextInput
                    label="Address"
                    placeholder={user?.address || ""}
                    {...register("address")}
                    error={errors.address?.message}
                    mb="sm"
                />
                <TextInput
                    label="State"
                    placeholder={user?.state || ""}
                    {...register("state")}
                    error={errors.state?.message}
                    mb="sm"
                />
                <TextInput
                    label="City"
                    placeholder={user?.city || ""}
                    {...register("city")}
                    error={errors.city?.message}
                    mb="sm"
                />
                <TextInput
                    label="Zip"
                    placeholder={user?.zip || ""}
                    {...register("zip")}
                    error={errors.zip?.message}
                    mb="sm"
                />
                <TextInput
                    label="First Name"
                    placeholder={user?.first_name || ""}
                    {...register("first_name")}
                    error={errors.first_name?.message}
                    mb="sm"
                />
                <TextInput
                    label="Last Name"
                    placeholder={user?.last_name || ""}
                    {...register("last_name")}
                    error={errors.last_name?.message}
                    mb="sm"
                />
                <TextInput
                    label="Middle Initial"
                    placeholder={user?.middle_initial || ""}
                    {...register("middle_initial")}
                    error={errors.middle_initial?.message}
                    mb="sm"
                />
                <Group mt="lg">
                    <Button type="submit" loading={mutation.isPending}>
                        Save Changes
                    </Button>
                </Group>
            </form>
        </Container>
    );
}
