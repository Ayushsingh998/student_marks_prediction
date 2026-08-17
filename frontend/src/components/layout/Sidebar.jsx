import React from "react";
import { Home, Sliders, LayoutDashboard, BarChart3 } from "lucide-react";

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">EduInsight AI</div>
      <button className={page === "home" ? "nav active" : "nav"} onClick={() => onNavigate("home")}>
        <Home size={18} />
        Home
      </button>
      <button className={page === "factors" ? "nav active" : "nav"} onClick={() => onNavigate("factors")}>
        <Sliders size={18} />
        Influencing Factors
      </button>
      <button className={page === "recommendations" ? "nav active" : "nav"} onClick={() => onNavigate("recommendations")}>
        <LayoutDashboard size={18} />
        Recommendations
      </button>
      <button className={page === "analysis" ? "nav active" : "nav"} onClick={() => onNavigate("analysis")}>
        <BarChart3 size={18} />
        Detailed Analysis
      </button>
    </aside>
  );
}
