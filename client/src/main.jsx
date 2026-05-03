import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2800,
            style: {
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#1f2933",
              boxShadow: "0 16px 40px rgba(31, 41, 51, 0.10)"
            },
            success: {
              iconTheme: {
                primary: "#16a34a",
                secondary: "#ffffff"
              }
            },
            error: {
              style: {
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c"
              },
              iconTheme: {
                primary: "#dc2626",
                secondary: "#ffffff"
              }
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
