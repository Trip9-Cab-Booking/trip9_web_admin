import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog/Dialog';
import { Button } from './ui/button/Button';

type DeleteConfirmModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void> | void;
    loading?: boolean;
    title?: string;
    description?: string;
    destructiveLabel?: string;
    cancelLabel?: string;
};

export default function DeleteConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    loading = false,
    title = 'Confirm delete',
    description = 'This action cannot be undone. Are you sure you want to delete this item?',
    destructiveLabel = 'Delete',
    cancelLabel = 'Cancel',
}: DeleteConfirmModalProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } finally {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                max-w-md
                bg-white dark:bg-gray-900
                text-gray-900 dark:text-gray-100
                border border-gray-200 dark:border-gray-700
            "
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2 px-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="gray"
                        onClick={() => onOpenChange(false)}
                        className="px-4 h-10"
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 h-10"
                        aria-disabled={loading}
                    >
                        {loading ? "Deleting…" : destructiveLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
