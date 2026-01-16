type Props = {
    value: "user" | "driver";
    onChange: (v: "user" | "driver") => void;
};

export default function AudienceSelector({ value, onChange }: Props) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    FAQ Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create FAQs for users and drivers
                </p>
            </div>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as any)}
                className="
                border border-gray-200 dark:border-gray-700
                rounded-md px-3 py-2 text-sm
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
            "
            >
                <option className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100" value="user">
                    User
                </option>
                <option className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100" value="driver">
                    Driver
                </option>
            </select>
        </div>
    );
}
