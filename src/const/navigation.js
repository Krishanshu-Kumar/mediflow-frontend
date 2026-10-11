import { FiLayers, FiSettings } from "react-icons/fi";

// Each item: { key, label, icon, children?: [{ key, label, icon, color, href? }] }
export const NAV_SECTIONS = [
  {
    key: "management",
    label: "Management",
    icon: FiSettings,
    children: [
      { key: "tenants", label: "Tenants", icon: FiLayers, color: "#0d9488", href: "/admin/tenants" },
    ],
  },
];

// Finds the menu and sub menu whose `href` is the given path, so a freshly mounted
// sidebar can highlight the current page.
export const findNavByPath = (pathname) => {
  for (const section of NAV_SECTIONS) {
    const child = section.children?.find(({ href }) => href === pathname);
    if (child) return { section: section.key, child: child.key };
  }
  return null;
};

// Key of the menu that starts expanded, or null for none.
export const DEFAULT_SECTION = null;

// Builds "Admin / <menu> / <sub menu>" labels for the header breadcrumb.
export const getBreadcrumbs = (sectionKey, childKey) => {
  const section = NAV_SECTIONS.find(({ key }) => key === sectionKey);
  if (!section) return ["Admin"];
  const child = section.children?.find(({ key }) => key === childKey);
  return child ? ["Admin", section.label, child.label] : ["Admin", section.label];
};
