"use client";

/** Full-screen loading overlay. Render it on a page with the `loading` flag from an API hook. */
export default function Loader({ show, label = "Loading" }) {
  if (!show) return null;

  return (
    <div className="mf-loader" role="status" aria-live="polite" aria-label={label}>
      <img src="/images/loading.gif" alt="" className="mf-loader-img" />
    </div>
  );
}
