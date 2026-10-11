"use client";

import { useEffect, useRef } from "react";

/**
 * Page-sized card that fills the space between the header and footer.
 * The top row holds an optional heading, `leading` (left) and `actions` (right); `footer`
 * is pinned to the bottom. Only the body scrolls, and it jumps back to the top whenever
 * `scrollResetKey` changes (e.g. the current page number).
 */
export default function PageCard({
  title,
  description,
  leading,
  actions,
  footer,
  scrollResetKey,
  children,
}) {
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [scrollResetKey]);

  return (
    <section className="mf-page-card">
      {(title || description || leading || actions) && (
        <div className="mf-page-card-header">
          {(title || description) && (
            <div className="mf-page-card-heading">
              {title && <h2 className="mf-page-card-title">{title}</h2>}
              {description && <p className="mf-page-card-description">{description}</p>}
            </div>
          )}
          {leading}
          {actions && <div className="mf-page-card-actions">{actions}</div>}
        </div>
      )}
      <div className="mf-page-card-body" ref={bodyRef}>
        {children}
      </div>
      {footer && <div className="mf-page-card-footer">{footer}</div>}
    </section>
  );
}
