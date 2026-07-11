import { useState } from "react";

interface ModalProps {
  message: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function Modal({ message, defaultValue = "", onConfirm, onCancel }: ModalProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#1e1e2f",
        border: "1px solid #333",
        padding: "2rem",
        borderRadius: "8px",
        minWidth: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
      }}>
        <p style={{ color: "#f0f0f5", margin: 0, fontSize: "1rem" }}>{message}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            border: "1px solid #444",
            borderRadius: "4px",
            background: "#2a2a3f",
            color: "#f0f0f5"
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.5rem 1rem",
              background: "#2a2a3f",
              color: "#f0f0f5",
              border: "1px solid #444",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(value)}
            style={{
              padding: "0.5rem 1rem",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}