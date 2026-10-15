import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: [
        '*.cloudpub.ru',
    ],

    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'loremflickr.com' },
        ],
    },
};

export default nextConfig;
