"use client";

import { useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
    audience: "user" | "driver";
    onCreate: (faq: { id: string; title: string }) => void;
};

export default function CreateFaqTitle({ audience, onCreate }: Props) {
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

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

            await axiosInstance.post(
                `/api/faq/add-title/${audience}`,
                {
                    titleId,
                    title: title.toUpperCase(),
                }
            );
            onCreate({
                id: titleId,
                title: title.toUpperCase(),
            });

            setTitle("");
        } catch (error) {
            console.error("Failed to add FAQ title:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 flex gap-3">
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
        </div>
    );
}
