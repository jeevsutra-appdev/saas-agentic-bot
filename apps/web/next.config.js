/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aether/ui", "@aether/db"],
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  compress: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverComponentsExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'pdf-parse', 'mammoth']
  },
};

export default nextConfig;
