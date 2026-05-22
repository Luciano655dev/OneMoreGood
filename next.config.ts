import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = []
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()

if (supabaseUrl) {
  try {
    const parsed = new URL(supabaseUrl)
    remotePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: "/storage/v1/object/public/**",
    })
  } catch {
    // Ignore malformed env values so local-only image paths still work.
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
