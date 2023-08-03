import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';

type InputProps = {
    value?: string;
    readOnly?: boolean;
    required?: boolean;
    className?: string;
    placeholder?: string;
    type?: 'text' | 'password';
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTouchStart?: (e: React.TouchEvent<HTMLInputElement>) => void;
};

export default function Input({
    value,
    readOnly,
    required,
    className,
    placeholder,
    type = 'text',
    onClick,
    onChange,
    onTouchStart,
}: InputProps) {
    const [focused, setFocused] = useState(false);
    return (
        <motion.input
            onFocus={(e) => setFocused(true)}
            onBlur={(e) => setFocused(false)}
            type={focused ? 'text' : type}
            value={value}
            required={required}
            readOnly={readOnly}
            placeholder={placeholder}
            className={clsx(
                'rounded border transition-all focus:outline-none',
                className,
            )}
            onClick={onClick}
            onChange={onChange}
            onTouchStart={onTouchStart}
        />
    );
}
