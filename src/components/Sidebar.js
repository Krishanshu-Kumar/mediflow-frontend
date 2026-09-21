"use client";

import { useState } from "react";
import {
  FiShare2,
  FiChevronLeft,
  FiChevronDown,
  FiTrendingUp,
  FiBriefcase,
  FiTarget,
  FiCheckSquare,
} from "react-icons/fi";
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

const NAV_SECTIONS = [
  { key: "executive", label: "Executive Overview", icon: FiTrendingUp },
  { key: "legal", label: "Legal Operations", icon: FiBriefcase },
  { key: "marketing", label: "Marketing", icon: FiTarget },
  { key: "productivity", label: "Productivity", icon: FiCheckSquare },
  {
    key: "social",
    label: "Social Media",
    icon: FiShare2,
    children: [
      { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#e1306c" },
      { key: "twitter", label: "Twitter", icon: FaTwitter, color: "#1da1f2" },
      { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877f2" },
      { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn, color: "#0a66c2" },
    ],
  },
];

export default function Sidebar() {
  const [openSection, setOpenSection] = useState("social");
  const [expanded, setExpanded] = useState(true);

  const selectSection = (key) => {
    setOpenSection(key);
    setExpanded(true);
  };

  if (!expanded) {
    return (
      <div className="mf-sidebar mf-sidebar-collapsed">
        <div className="mf-sidebar-header mf-sidebar-header-stacked">
          <span className="mf-sidebar-logo-mark" aria-hidden="true">
            *
          </span>
          <button
            type="button"
            className="mf-sidebar-toggle-btn"
            onClick={() => setExpanded(true)}
            aria-label="Expand sidebar"
            title="Expand"
          >
            <FiChevronLeft size={16} className="mf-sidebar-toggle-icon is-collapsed" />
          </button>
        </div>
        <div className="mf-sidebar-rail-icons">
          {NAV_SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`mf-sidebar-rail-btn${
                openSection === key ? " is-active" : ""
              }`}
              onClick={() => selectSection(key)}
              aria-label={label}
              title={label}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mf-sidebar mf-sidebar-expanded">
      <div className="mf-sidebar-panel">
        <div className="mf-sidebar-header">
          <span className="mf-sidebar-logo-mark" aria-hidden="true">
            *
          </span>
          <span className="mf-sidebar-title">Dashboard</span>
          <button
            type="button"
            className="mf-sidebar-toggle-btn"
            onClick={() => setExpanded(false)}
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <FiChevronLeft size={16} className="mf-sidebar-toggle-icon" />
          </button>
        </div>

        <nav className="mf-sidebar-nav">
          {NAV_SECTIONS.map((section) => {
            const isOpen = openSection === section.key;
            const hasChildren = Boolean(section.children);
            const SectionIcon = section.icon;

            return (
              <div key={section.key} className="mf-sidebar-section">
                <button
                  type="button"
                  className={`mf-sidebar-section-btn${isOpen ? " is-open" : ""}`}
                  onClick={() => setOpenSection(section.key)}
                >
                  <span className="mf-sidebar-section-label">
                    <SectionIcon size={16} />
                    {section.label}
                  </span>
                  {hasChildren && (
                    <FiChevronDown
                      size={15}
                      className={`mf-sidebar-chevron${isOpen ? " is-open" : ""}`}
                    />
                  )}
                </button>

                {hasChildren && isOpen && (
                  <div className="mf-sidebar-children">
                    {section.children.map(({ key, label, icon: Icon, color }) => (
                      <button key={key} type="button" className="mf-sidebar-child-btn">
                        <Icon size={15} style={{ color }} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
