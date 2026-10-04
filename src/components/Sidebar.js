"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { NAV_SECTIONS, DEFAULT_SECTION } from "@/const/navigation";

// TODO: replace with the signed-in user once the auth API is available.
const CURRENT_USER = { name: "Admin User", email: "admin@mediflow.com" };

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// A menu matching the query keeps all its sub menus; otherwise only matching sub menus stay.
const filterSections = (query) => {
  const term = query.trim().toLowerCase();
  if (!term) return NAV_SECTIONS;
  const matches = (label) => label.toLowerCase().includes(term);

  return NAV_SECTIONS.flatMap((section) => {
    if (matches(section.label)) return [section];
    const children = section.children?.filter((child) => matches(child.label));
    return children?.length ? [{ ...section, children }] : [];
  });
};

export default function Sidebar({ onNavigate }) {
  const router = useRouter();
  const [openSection, setOpenSection] = useState(DEFAULT_SECTION);
  const [expanded, setExpanded] = useState(true);
  const [activeChild, setActiveChild] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  const isSearching = searchQuery.trim() !== "";
  const visibleSections = filterSections(searchQuery);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const collapse = () => {
    setProfileOpen(false);
    setExpanded(false);
  };

  const toggleProfile = () => {
    // The menu needs the full sidebar width, so expand first if collapsed.
    if (!expanded) {
      setExpanded(true);
      setProfileOpen(true);
      return;
    }
    setProfileOpen((prev) => !prev);
  };

  const signOut = () => {
    // TODO: clear the session via the auth API once available.
    setProfileOpen(false);
    router.push("/");
  };

  const selectSection = (key, hasChildren) => {
    if (hasChildren) {
      setOpenSection((prev) => (prev === key ? null : key));
    } else {
      setOpenSection(key);
    }
    setExpanded(true);
    // Keep the active sub menu in the breadcrumb only if it belongs to this menu.
    const section = NAV_SECTIONS.find((item) => item.key === key);
    const keepChild = section.children?.some((child) => child.key === activeChild);
    onNavigate?.(key, keepChild ? activeChild : null);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") setSearchQuery("");
  };

  const selectChild = (sectionKey, childKey) => {
    setActiveChild(childKey);
    onNavigate?.(sectionKey, childKey);
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
            <Image src="/images/mediflow-logo.png" alt="MediFlow" width={40} height={40} priority />
          </button>
          <span className="mf-sidebar-title mf-sidebar-fade">MediFlow</span>
          <button
            type="button"
            className="mf-sidebar-toggle-btn"
            onClick={collapse}
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <FiChevronLeft size={16} className="mf-sidebar-toggle-icon" />
          </button>
        </div>

        <div className="mf-sidebar-divider" role="separator" />

        <div
          className="mf-sidebar-search"
          onClick={() => searchInputRef.current?.focus()}
          title={expanded ? undefined : "Search menu"}
        >
          <FiSearch size={16} className="mf-sidebar-search-icon" />
          <input
            ref={searchInputRef}
            type="search"
            className="mf-sidebar-search-input"
            placeholder="Search menu..."
            aria-label="Search menu"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              className="mf-sidebar-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              title="Clear"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <nav className="mf-sidebar-nav">
          {visibleSections.length === 0 && (
            <p className="mf-sidebar-search-empty mf-sidebar-fade">No menu matches</p>
          )}
          {visibleSections.map((section) => {
            const isOpen = openSection === section.key;
            const hasChildren = Boolean(section.children);
            // While searching, show every sub menu list so matches are visible.
            const showChildren = hasChildren && (isSearching || isOpen);
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
                        showChildren ? " is-open" : ""
                      }`}
                    />
                  )}
                </button>

                {hasChildren && (
                  <div
                    className={`mf-sidebar-children${
                      showChildren && expanded ? " is-open" : ""
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
                              onClick={() => selectChild(section.key, key)}
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

        <div className="mf-sidebar-profile" ref={profileRef}>
          <div
            className={`mf-sidebar-profile-menu${profileOpen ? " is-open" : ""}`}
            role="menu"
            aria-hidden={!profileOpen}
          >
            <button
              type="button"
              className="mf-sidebar-profile-menu-item is-danger"
              role="menuitem"
              tabIndex={profileOpen ? 0 : -1}
              onClick={signOut}
            >
              <FiLogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          <button
            type="button"
            className={`mf-sidebar-profile-btn${profileOpen ? " is-open" : ""}`}
            onClick={toggleProfile}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            aria-label={`${CURRENT_USER.name} account menu`}
            title={CURRENT_USER.name}
          >
            <span className="mf-sidebar-avatar">{getInitials(CURRENT_USER.name)}</span>
            <span className="mf-sidebar-profile-info mf-sidebar-fade">
              <span className="mf-sidebar-profile-name">{CURRENT_USER.name}</span>
              <span className="mf-sidebar-profile-email">{CURRENT_USER.email}</span>
            </span>
            <FiChevronUp
              size={16}
              className={`mf-sidebar-chevron mf-sidebar-fade${
                profileOpen ? " is-open" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
