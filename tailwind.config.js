/** @type {import('tailwindcss').Config} */
export default {
    content: [],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                mytheme: {
                    "primary": "#079292",
                    "secondary": "#079292",
                    "accent": "#079292",
                    "neutral": "#ffffff",
                    "base-100": "#ffffff",
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87272"
                }
            }
        ]
    }
}

