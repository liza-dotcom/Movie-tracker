import { useState } from "react";

interface CompletedEntryModalProps {
  entry: {
    title: string;
    rating: number;
    notes: string;
  };
  onConfirm: (rating: number | null, notes: string) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function CompletedEntryModal({ entry, onConfirm, onDelete, onCancel }: CompletedEntryModalProps) {
  const [rating, setRating] = useState(entry.rating?.toString() || "");
  const [notes, setNotes] = useState(entry.notes || "");

  const handleConfirm = () => {
    const numericRating = rating.trim() !== "" ? parseFloat(rating) : null;
    if (numericRating !== null && (numericRating < 1 || numericRating > 10)) {
      alert("Rating must be between 1 and 10.");
      return;
    }
    onConfirm(numericRating, notes);
  };

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
        minWidth: "320px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
      }}>
        <h3 style={{ color: "#f0f0f5", margin: 0 }}>Update: {entry.title}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ color: "#cfd6e4", fontSize: "0.9rem" }}>Rating (1-10)</label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #444",
              borderRadius: "4px",
              background: "#2a2a3f",
              color: "#f0f0f5"
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ color: "#cfd6e4", fontSize: "0.9rem" }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #444",
              borderRadius: "4px",
              background: "#2a2a3f",
              color: "#f0f0f5",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between" }}>
          <button
            onClick={onDelete}
            style={{
              padding: "0.5rem 1rem",
              background: "#e50914",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Remove from List
          </button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
              onClick={handleConfirm}
              style={{
                padding: "0.5rem 1rem",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}