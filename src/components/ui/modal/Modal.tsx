import React from "react";

export default function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[70vh]">{children}</div>
            </div>
        </div>
    );
}
