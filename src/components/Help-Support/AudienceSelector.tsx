type Props = {
    value: "user" | "driver";
    onChange: (v: "user" | "driver") => void;
};

export default function AudienceSelector({ value, onChange }: Props) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-xl font-semibold">FAQ Management</h1>
                <p className="text-sm text-gray-500">Create FAQs for users and drivers</p>
            </div>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800"
            >
                <option value="user">User</option>
                <option value="driver">Driver</option>
            </select>
        </div>
    );
}
