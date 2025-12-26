"use client";

import { useEffect, useState } from "react";
import QaList from "./QaList";
import { FAQ, QA } from "./AdminHelpSupportPage";
import { axiosInstance } from "../../utils/axiosInstance";

type Props = {
    faq: FAQ;
    audience: "user" | "driver";
    openTitleId: string | null;
    setOpenTitleId: (id: string | null) => void;
    setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
    editingQaId: string | null;
    setEditingQaId: (id: string | null) => void;
};

export default function FaqItem({
    faq,
    audience,
    openTitleId,
    setOpenTitleId,
    setFaqs,
    editingQaId,
    setEditingQaId,
}: Props) {
    const isOpen = openTitleId === faq.id;
    const [loadingQa, setLoadingQa] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (!faq.id) return;
        if (faq.source !== "backend") return;
        if (faq.qas && faq.qas.length > 0) return;

        const fetchQas = async () => {
            try {
                setLoadingQa(true);
                console.log("Calling QA API with titleId:", faq.id);

                const response = await axiosInstance.get<{
                    data: { q: string; a: string; _id: string }[];
                }>(
                    `/api/faq/fetch-qa/${audience}/${faq.id}`
                );
                const mappedQas: QA[] = response.data.data.map((item) => ({
                    id: item._id,
                    question: item.q,
                    answer: item.a,
                }));

                setFaqs((prev) =>
                    prev.map((f) =>
                        f.id === faq.id ? { ...f, qas: mappedQas } : f
                    )
                );

            } catch (error) {
                console.error("Failed to fetch QAs:", error);
            } finally {
                setLoadingQa(false);
            }
        };

        fetchQas();
    }, [isOpen, faq.id, faq.source, audience]);

    return (
        <div className="border rounded-lg bg-white">
            <button
                onClick={() => setOpenTitleId(isOpen ? null : faq.id)}
                className="w-full px-5 py-4 flex justify-between font-medium"
            >
                {faq.title}
                <span>{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
                <>
                    {loadingQa ? (
                        <p className="p-5 text-sm text-gray-500">Loading questions…</p>
                    ) : (
                        <QaList
                            faq={faq}
                            audience={audience}
                            editingQaId={editingQaId}
                            setEditingQaId={setEditingQaId}
                            setFaqs={setFaqs}
                        />
                    )}
                </>
            )}
        </div>
    );
}
