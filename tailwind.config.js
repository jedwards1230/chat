/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontSize: {
                xs: ['11px', '16px'],
                sm: ['13px', '18px'],
                base: ['15px', '22px'],
                lg: ['19px', '26px'],
                xl: ['23px', '30px'],
            },
            gridTemplateColumns: {
                16: 'repeat(16, minmax(0, 1fr))',
            },
        },
    },
    plugins: [],
};
