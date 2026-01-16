"use client";

import { useEffect, useState } from "react";
import QaList from "./QaList";
import { FAQ, QA } from "./AdminHelpSupportPage";
import { Trash2 } from "lucide-react";
import { axiosInstance } from "../../utils/axiosInstance";
import DeleteConfirmModal from "../DeleteConfirmModal";
import CustomSnackbar from "../CustomSnackbar";

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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] =
        useState<"success" | "error" | "info">("info");



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

    // API call to delete FAQ
    const deleteFaq = async (faqId: string) => {
        await axiosInstance.delete(
            `/api/faq/delete-title/${audience}/${faqId}`
        );
    };

    // Delete FAQ handler
    const handleConfirmDelete = async () => {
        if (!deleteFaqId) return;

        try {
            setDeleteLoading(true);

            await deleteFaq(deleteFaqId);

            setFaqs((prev) => prev.filter((f) => f.id !== deleteFaqId));

            // Show success snackbar
            setSnackbarMessage("FAQ title deleted successfully.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            // Close modal AFTER success
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete FAQ:", error);

            setSnackbarMessage("Failed to delete FAQ. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setDeleteLoading(false);
            setDeleteFaqId(null);
        }
    };



    return (
        <div className="border rounded-lg bg-white dark:bg-gray-800">
            <button
                onClick={() => setOpenTitleId(isOpen ? null : faq.id)}
                className="
        w-full px-5 py-4
        flex justify-between items-center
        font-medium text-left
        text-gray-900 dark:text-gray-100
        hover:bg-gray-50 dark:hover:bg-gray-800
    "
            >
                <span>{faq.title}</span>

                <div className="flex items-center gap-4">
                    {/* Toggle icon */}
                    <span className="text-lg">
                        {isOpen ? "−" : "+"}
                    </span>

                    {/* Delete icon */}
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteFaqId(faq.id);
                            setDeleteModalOpen(true);
                        }}
                        className="
                p-1 rounded-md
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                cursor-pointer
            "
                        aria-label="Delete FAQ"
                    >
                        <Trash2 size={15} />
                    </span>
                </div>
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

            <DeleteConfirmModal
                open={deleteModalOpen}
                onOpenChange={setDeleteModalOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                title="Delete FAQ"
                description="This FAQ will be permanently deleted. This action cannot be undone."
                destructiveLabel="Delete"
                cancelLabel="Cancel"
            />
            <CustomSnackbar
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={() => setSnackbarOpen(false)}
            />

        </div>
    );
}
