export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2933",
        paper: "#f1ece3",
        panel: "#ffffff",
        sand: "#ece4d8",
        line: "#e5e7eb",
        mint: "#0f766e",
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e"
        },
        warm: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          700: "#b45309"
        },
        success: {
          50: "#dcfce7",
          700: "#15803d"
        },
        danger: {
          50: "#fee2e2",
          700: "#b91c1c"
        },
        info: {
          50: "#dbeafe",
          700: "#1d4ed8"
        }
      },
      boxShadow: {
        soft: "0 24px 60px rgba(31, 41, 51, 0.08)",
        card: "0 10px 30px rgba(31, 41, 51, 0.06)"
      },
      borderRadius: {
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};
