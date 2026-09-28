"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { FiSearch, FiBell, FiChevronRight, FiSun, FiMoon } from "react-icons/fi";

const THEME_OPTIONS = [
  { key: "light", label: "Light", icon: FiSun },
  { key: "dark", label: "Dark", icon: FiMoon },
];

export default function Header({ title = "Dashboard", breadcrumbs = [] }) {
  const [query, setQuery] = useState("");
  // TODO: wire up to the notifications API once available.
  const [unreadCount] = useState(3);
  // UI only for now — TODO: apply the chosen theme to the app.
  const [theme, setTheme] = useState("light");

  const handleSearch = (event) => {
    event.preventDefault();
    // TODO: hook up global search once the API is available.
  };

  return (
    <header className="mf-header">
      <div className="mf-header-heading">
        <h1 className="mf-header-title">{title}</h1>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="mf-header-breadcrumb">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <Fragment key={`${index}-${crumb}`}>
                    {index > 0 && (
                      <li className="mf-header-breadcrumb-sep" aria-hidden="true">
                        <FiChevronRight size={13} />
                      </li>
                    )}
                    <li
                      className={`mf-header-breadcrumb-item${isLast ? " is-current" : ""}`}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </nav>
        )}
      </div>

      <div className="mf-header-logo">
        <Image
          src="/mediflow-logo-2.png"
          alt="MediFlow"
          width={931}
          height={231}
          priority
        />
      </div>

      <div className="mf-header-actions">
        <form className="mf-header-search" role="search" onSubmit={handleSearch}>
          <FiSearch size={16} className="mf-header-search-icon" />
          <input
            type="search"
            className="mf-header-search-input"
            placeholder="Search..."
            aria-label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <div
          className="mf-header-theme"
          role="radiogroup"
          aria-label="Colour theme"
          data-active={theme}
        >
          <span className="mf-header-theme-indicator" aria-hidden="true" />
          {THEME_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={theme === key}
              className={`mf-header-theme-btn${theme === key ? " is-active" : ""}`}
              onClick={() => setTheme(key)}
              aria-label={`${label} mode`}
              title={`${label} mode`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mf-header-icon-btn"
          aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
          title="Notifications"
        >
          <FiBell size={18} />
          {unreadCount > 0 && (
            <span className="mf-header-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
