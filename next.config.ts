import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This machine has another package-lock.json above the project. Pinning the
  // root keeps Turbopack from scanning unrelated home-directory worktrees.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
