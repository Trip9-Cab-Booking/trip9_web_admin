"use client";

import { useState, useEffect } from "react";
import AudienceSelector from "./AudienceSelector";
import CreateFaqTitle from "./CreateFaqTitle";
import FaqList from "./FaqList";
import { axiosInstance } from "../../utils/axiosInstance";

export type QA = {
    id: string;
    question: string;
    answer: string;
};

export type FAQ = {
    id: string;
    title: string;
    audience: "user" | "driver";
    qas?: QA[];
    source: "backend" | "local";
};

export default function AdminHelpSupportPage() {
    const [audience, setAudience] = useState<"user" | "driver">("user");
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [openTitleId, setOpenTitleId] = useState<string | null>(null);
    const [editingQaId, setEditingQaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchTitles = async () => {
            try {
                setLoading(true);

                const response = await axiosInstance.get<{
                    data: { titleId: string; title: string }[];
                }>(`/api/faq/fetch-titles/${audience}`);

                if (!isMounted) return;

                const faqsArray: FAQ[] = response.data.data.map((item) => ({
                    id: item.titleId,
                    title: item.title,
                    audience,
                    qas: undefined,
                    source: "backend",
                }));


                console.log("FAQ TITLES RAW RESPONSE:", response.data.data);

                setFaqs(faqsArray);
                setOpenTitleId(null);
                setEditingQaId(null);
            } catch (error) {
                console.error("Failed to fetch FAQ titles:", error);
                if (isMounted) {
                    setFaqs([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTitles();

        return () => {
            isMounted = false;
        };
    }, [audience]);



    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <AudienceSelector value={audience} onChange={setAudience} />

            <CreateFaqTitle
                audience={audience}
                onCreate={({ id, title }) =>
                    setFaqs((prev) => [
                        ...prev,
                        {
                            id,
                            title,
                            audience,
                            qas: [],
                            source: "backend",
                        },
                    ])
                }

            />

            {loading ? (
                <p className="text-sm text-gray-500">Loading FAQ titles…</p>
            ) : (
                <FaqList
                    faqs={faqs}
                    audience={audience}
                    openTitleId={openTitleId}
                    setOpenTitleId={setOpenTitleId}
                    setFaqs={setFaqs}
                    editingQaId={editingQaId}
                    setEditingQaId={setEditingQaId}
                />

            )}
        </div>
    );
}
