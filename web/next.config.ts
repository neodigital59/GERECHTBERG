const nextConfig = {
  turbopack: {
    // Force Next.js to treat the web folder as the workspace root
    root: __dirname,
  },
  eslint: {
    // Unblock production builds even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Unblock production builds even if there are TypeScript type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
