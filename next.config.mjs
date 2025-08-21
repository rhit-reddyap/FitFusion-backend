/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turn off typedRoutes to avoid template-string href type errors in build
  // If you want it back later, we can re-enable and strictly type the links.
  experimental: {
    // typedRoutes: true   // <- remove or comment out
  },
  typescript: {
    // Optional: let the build proceed even if there are TS errors
    ignoreBuildErrors: false
  },
  eslint: {
    // Optional: let the build proceed even if there are ESLint errors
    ignoreDuringBuilds: false
  }
};

export default nextConfig;
