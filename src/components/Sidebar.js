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
  FiActivity,
  FiMail,
  FiSearch,
  FiBarChart2,
} from "react-icons/fi";
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

const NAV_SECTIONS = [
  { key: "executive", label: "Executive Overview", icon: FiTrendingUp },
  { key: "legal", label: "Legal Operations", icon: FiBriefcase },
  {
    key: "marketing",
    label: "Marketing",
    icon: FiTarget,
    children: [
      { key: "campaigns", label: "Campaigns", icon: FiMail, color: "#f59e0b" },
      { key: "seo", label: "SEO", icon: FiSearch, color: "#10b981" },
      { key: "analytics", label: "Analytics", icon: FiBarChart2, color: "#6366f1" },
    ],
  },
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
  const [activeChild, setActiveChild] = useState(null);

  const selectSection = (key, hasChildren) => {
    if (hasChildren) {
      setOpenSection((prev) => (prev === key ? null : key));
    } else {
      setOpenSection(key);
    }
    setExpanded(true);
  };

  return (
    <div
      className={`mf-sidebar${
        expanded ? " mf-sidebar-expanded" : " mf-sidebar-collapsed"
      }`}
    >
      <div className="mf-sidebar-panel">
        <div className="mf-sidebar-header">
          <button
            type="button"
            className="mf-sidebar-logo-mark"
            onClick={() => setExpanded(true)}
            aria-label="Expand sidebar"
            title="Expand"
          >
            <FiActivity size={20} />
          </button>
          <span className="mf-sidebar-title mf-sidebar-fade">MediFlow</span>
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
                  onClick={() => selectSection(section.key, hasChildren)}
                  aria-label={section.label}
                  title={section.label}
                >
                  <span className="mf-sidebar-section-label">
                    <SectionIcon size={19} className="mf-sidebar-section-icon" />
                    <span className="mf-sidebar-fade">{section.label}</span>
                  </span>
                  {hasChildren && (
                    <FiChevronDown
                      size={17}
                      className={`mf-sidebar-chevron mf-sidebar-fade${
                        isOpen ? " is-open" : ""
                      }`}
                    />
                  )}
                </button>

                {hasChildren && (
                  <div
                    className={`mf-sidebar-children${
                      isOpen && expanded ? " is-open" : ""
                    }`}
                  >
                    <div className="mf-sidebar-children-inner">
                      {section.children.map(({ key, label, icon: Icon, color }) => {
                        const isChildActive = activeChild === key;
                        return (
                          <div key={key} className="mf-sidebar-tree-item">
                            <button
                              type="button"
                              className={`mf-sidebar-child-btn${
                                isChildActive ? " is-active" : ""
                              }`}
                              style={
                                isChildActive
                                  ? {
                                      backgroundColor: `${color}17`,
                                      boxShadow: `inset 3px 0 0 0 ${color}`,
                                    }
                                  : undefined
                              }
                              onClick={() => setActiveChild(key)}
                            >
                              <Icon size={17} style={{ color }} />
                              <span>{label}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
