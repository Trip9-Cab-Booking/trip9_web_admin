"use client";

import { useState } from "react";
import { QA, FAQ } from "./AdminHelpSupportPage";
import { axiosInstance } from "../../utils/axiosInstance";
import CustomSnackbar from "../CustomSnackbar";

type Props = {
    qa: QA;
    faqId: string;
    audience: "user" | "driver";
    setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
    onCancel: () => void;
    onSave: () => void;
};

export default function EditQaForm({
    qa,
    faqId,
    audience,
    setFaqs,
    onCancel,
    onSave,
}: Props) {
    const [question, setQuestion] = useState(qa.question);
    const [answer, setAnswer] = useState(qa.answer);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "info"
    >("info");


    const isNew = qa.id === "NEW";

    const handleSave = async () => {
        if (!question.trim() || !answer.trim()) return;

        try {
            setLoading(true);

            if (isNew) {
                const response = await axiosInstance.post<{
                    data: { _id: string; q: string; a: string };
                }>(
                    `/api/faq/add-qa/${audience}/${faqId}`,
                    { q: question, a: answer }
                );

                const newQa: QA = {
                    id: response.data.data._id,
                    question: response.data.data.q,
                    answer: response.data.data.a,
                };

                setFaqs((prev) =>
                    prev.map((f) =>
                        f.id === faqId
                            ? { ...f, qas: [...(f.qas ?? []), newQa] }
                            : f
                    )
                );

                setSnackbarMessage("Question added successfully");
            } else {
                await axiosInstance.patch(
                    `/api/faq/update-qa/${audience}/${faqId}/${qa.id}`,
                    { q: question, a: answer }
                );

                setFaqs((prev) =>
                    prev.map((f) =>
                        f.id === faqId
                            ? {
                                ...f,
                                qas: (f.qas ?? []).map((q) =>
                                    q.id === qa.id
                                        ? { ...q, question, answer }
                                        : q
                                ),
                            }
                            : f
                    )
                );

                setSnackbarMessage("Question updated successfully");
            }

            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setTimeout(() => {
                onSave();
            }, 1000);

        } catch (error) {
            console.error("Failed to save QA:", error);
            setSnackbarMessage("Failed to save question");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-2">
            <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Question"
                className="w-full border px-2 py-1 text-sm rounded"
            />
            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full border px-2 py-1 text-sm rounded"
            />
            <div className="flex gap-3 text-sm">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="text-blue-600 disabled:opacity-50"
                >
                    {loading ? "Saving..." : "Save"}
                </button>
                <button onClick={onCancel} className="text-gray-500">
                    Cancel
                </button>
            </div>

            <CustomSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
            />

        </div>
    );
}
