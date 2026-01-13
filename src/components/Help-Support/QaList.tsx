"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { FAQ } from "./AdminHelpSupportPage";
import EditQaForm from "./EditQaForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { axiosInstance } from "@/utils/axiosInstance";
import CustomSnackbar from "../CustomSnackbar";

type Props = {
    faq: FAQ;
    audience: "user" | "driver";
    editingQaId: string | null;
    setEditingQaId: (id: string | null) => void;
    setFaqs: Dispatch<SetStateAction<FAQ[]>>;
};

export default function QaList({
    faq,
    audience,
    editingQaId,
    setEditingQaId,
    setFaqs,
}: Props) {
    const qas = faq.qas ?? [];

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [qaIdToDelete, setQaIdToDelete] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<
        "success" | "error" | "info"
    >("info");


    const openDeleteModal = (qaId: string) => {
        setQaIdToDelete(qaId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!qaIdToDelete) return;

        try {
            setDeleteLoading(true);

            await axiosInstance.delete(
                `/api/faq/delete-qa/${audience}/${faq.id}/${qaIdToDelete}`
            );

            setFaqs((prev) =>
                prev.map((f) =>
                    f.id === faq.id
                        ? {
                            ...f,
                            qas: (f.qas ?? []).filter(
                                (q) => q.id !== qaIdToDelete
                            ),
                        }
                        : f
                )
            );
            setSnackbarMessage("Question and Answer deleted successfully");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Failed to delete QA:", error);

            setSnackbarMessage("Failed to delete question");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setDeleteLoading(false);
            setDeleteModalOpen(false);
            setQaIdToDelete(null);
        }
    };


    return (
        <>
            <div className="border-t p-5 space-y-4 bg-gray-50 dark:bg-gray-800">
                {qas.length === 0 && editingQaId !== "NEW" && (
                    <p className="text-sm text-gray-500">
                        No questions added yet.
                    </p>
                )}

                {editingQaId === "NEW" && (
                    <div className="bg-white border rounded-md p-4 ">
                        <EditQaForm
                            qa={{ id: "NEW", question: "", answer: "" }}
                            faqId={faq.id}
                            audience={audience}
                            setFaqs={setFaqs}
                            onCancel={() => setEditingQaId(null)}
                            onSave={() => setEditingQaId(null)}
                        />
                    </div>
                )}

                {qas.map((qa) => (
                    <div
                        key={qa.id}
                        className="bg-white border rounded-md p-4 dark:bg-gray-800"
                    >
                        {editingQaId === qa.id ? (
                            <EditQaForm
                                qa={qa}
                                faqId={faq.id}
                                audience={audience}
                                setFaqs={setFaqs}
                                onCancel={() => setEditingQaId(null)}
                                onSave={() => setEditingQaId(null)}
                            />
                        ) : (
                            <>
                                <p className="font-medium text-sm">
                                    {qa.question}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {qa.answer}
                                </p>

                                <div className="flex gap-4 mt-3 text-sm">
                                    <button
                                        onClick={() =>
                                            setEditingQaId(qa.id)
                                        }
                                        className="text-blue-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            openDeleteModal(qa.id)
                                        }
                                        className="text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => setEditingQaId("NEW")}
                    className="text-blue-600 text-sm font-medium"
                >
                    + Add Question
                </button>
            </div>

            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                title="Delete question"
                description="This question will be permanently deleted. This action cannot be undone."
                destructiveLabel="Delete"
                cancelLabel="Cancel"
            />

            <CustomSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
            />

        </>
    );
}
