export default function Select({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: {
        label: string;
        value: Model;
    }[];
}) {
    return (
        <label className="flex w-full items-center justify-between py-2">
            <span>{label}</span>
            <select
                className="ml-2 rounded-lg border p-2"
                value={value}
                onChange={onChange}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
