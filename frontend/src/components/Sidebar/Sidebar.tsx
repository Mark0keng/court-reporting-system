import React from "react";
import { NavLink } from "react-router-dom";
import {
  Briefcase,
  Users,
  Gavel,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import "./Sidebar.scss";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "reporter":
        return "Court Reporter";
      case "editor":
        return "Transcript Editor";
      default:
        return role;
    }
  };

  return (
    <aside className="sidebar-aside">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Gavel />
        </div>
        <div>
          <span className="sidebar-brand-title">COURT CRS</span>
          <span className="sidebar-brand-subtitle">Court Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-title">Main Menu</span>

        {user?.role === "admin" ? (
          <>
            {/* Jobs NavLink */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
              }
            >
              <Briefcase className="sidebar-link-icon" />
              <span>Manage Jobs</span>
            </NavLink>

            {/* Users NavLink */}
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
              }
            >
              <Users className="sidebar-link-icon" />
              <span>Manage Users</span>
            </NavLink>
          </>
        ) : user?.role === "reporter" ? (
          <>
            {/* Reporter Jobs NavLink */}
            <NavLink
              to="/reporter/jobs"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
              }
            >
              <Briefcase className="sidebar-link-icon" />
              <span>My Jobs</span>
            </NavLink>
          </>
        ) : user?.role === "editor" ? (
          <>
            {/* Editor Jobs NavLink */}
            <NavLink
              to="/editor/jobs"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`
              }
            >
              <Briefcase className="sidebar-link-icon" />
              <span>Review Transcripts</span>
            </NavLink>
          </>
        ) : null}
      </nav>

      {/* User Profile Card Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-profile-pic">
            {user ? getInitials(user.name) : "AD"}
          </div>
          <div>
            <span className="sidebar-profile-name">
              {user ? user.name : "Main Admin"}
            </span>
            <span className="sidebar-profile-role">
              {user ? getRoleLabel(user.role) : "Administrator"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="sidebar-logout-btn"
          title="Log Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
