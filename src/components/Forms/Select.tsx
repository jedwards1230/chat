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
		<label className="flex items-center justify-between w-full py-2">
			<span>{label}</span>
			<select
				className="p-2 ml-2 border rounded-lg"
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
