import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-header-badge">CRS Control Center</span>
        <span className="app-header-divider">/</span>
        <span className="app-header-title">Court Reporting System</span>
      </div>
    </header>
  );
};

export default Header;
