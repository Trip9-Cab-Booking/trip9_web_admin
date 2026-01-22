"use client";

import { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import CustomSnackbar from "../CustomSnackbar";
import axios from "axios";

type Props = {
    audience: "user" | "driver";
    onCreate: (faq: { id: string; title: string }) => void;
};

export default function CreateFaqTitle({ audience, onCreate }: Props) {
    const [title, setTitle] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({
        open: false,
        message: "",
        severity: "info",
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const generateTitleId = (value: string) =>
        value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");



    const handleAdd = async () => {
        if (!title.trim()) return;
        const titleId = generateTitleId(title);

        try {
            setLoading(true);
            await axiosInstance.post(`/api/faq/add-title/${audience}`, {
                titleId,
                title: title.toUpperCase(),
            });

            onCreate({ id: titleId, title: title.toUpperCase() });
            setTitle("");
            setSnackbar({
                open: true,
                message: "Title added successfully!",
                severity: "success",
            });

        } catch (error: unknown) {
            let backendMessage = "Failed to add title";
            if (axios.isAxiosError(error)) {
                backendMessage = error.response?.data?.message || backendMessage;
            } else if (error instanceof Error) {
                backendMessage = error.message;
            }
            setSnackbar({
                open: true,
                message: backendMessage,
                severity: "error",
            });
            console.error("Add FAQ Title Error:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-white border rounded-lg p-4 flex gap-3 dark:bg-gray-800">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="FAQ title (e.g. Payments, Login)"
                className="flex-1 border rounded-md px-3 py-2 text-sm"
            />

            <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
                {loading ? "Adding..." : "Add Title"}
            </button>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </div>
    );
}
