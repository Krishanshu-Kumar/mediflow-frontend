import {
  FiShare2,
  FiTrendingUp,
  FiBriefcase,
  FiTarget,
  FiCheckSquare,
  FiMail,
  FiSearch,
  FiBarChart2,
} from "react-icons/fi";
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export const NAV_SECTIONS = [
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

export const DEFAULT_SECTION = "social";

// Builds "Admin / <menu> / <sub menu>" labels for the header breadcrumb.
export const getBreadcrumbs = (sectionKey, childKey) => {
  const section = NAV_SECTIONS.find(({ key }) => key === sectionKey);
  if (!section) return ["Admin"];
  const child = section.children?.find(({ key }) => key === childKey);
  return child ? ["Admin", section.label, child.label] : ["Admin", section.label];
};
