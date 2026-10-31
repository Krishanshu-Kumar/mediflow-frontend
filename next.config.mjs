/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Strict Mode re-runs effects in dev, which made every API call fire twice.
  reactStrictMode: false,
};

export default nextConfig;
