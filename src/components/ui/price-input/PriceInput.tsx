type PriceInputProps = {
    label: string;
    value: number | "";
    onChange: (v: number | "") => void;
    disabled?: boolean;
};

export default function PriceInput({
    label,
    value,
    onChange,
    disabled = false,
}: PriceInputProps) {
    return (
        <label className="block">
            <div className="text-xs text-gray-600 dark:text-white mb-1">{label}</div>
            <input
                type="number"
                disabled={disabled}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`w-full rounded border p-2 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
            />
        </label>
    );
}
