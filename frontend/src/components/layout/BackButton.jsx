import React from "react";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ onClick }) {
  return (
    <button className="back" onClick={onClick}>
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
