const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: false,
    reloadOnOnline: true,
    fallbacks: {
        image: '/fallback-image.png',
        document: '/offline.html',
    },
    buildExcludes: [/middleware-manifest.json$/],
    workboxOptions: {
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts',
                    expiration: {
                        maxEntries: 4,
                        maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
                    },
                },
            },
            {
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'firebase-api',
                    expiration: {
                        maxEntries: 16,
                        maxAgeSeconds: 24 * 60 * 60, // 1 day
                    },
                },
            },
        ],
    },
});

module.exports = withPWA({
    reactStrictMode: true,

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        // Enable AVIF format (better compression than WebP)
        formats: ['image/avif', 'image/webp'],
        // Cache optimized images for 1 year
        minimumCacheTTL: 31536000,
        // Responsive image sizes
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Code splitting optimization
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks?.cacheGroups,
                    // Separate vendor chunks
                    vendor: {
                        test: /node_modules/,
                        name: 'vendors',
                        priority: 10,
                        chunks: 'all',
                    },
                    // Separate Firebase into its own chunk
                    firebase: {
                        test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
                        name: 'firebase',
                        priority: 20,
                        chunks: 'all',
                    },
                },
            };
        }
        return config;
    },

    // Enable compression
    compress: true,

    // Cache headers for performance
    headers: async () => [
        {
            source: '/images/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
        {
            source: '/fonts/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable',
                },
            ],
        },
        {
            source: '/api/:path*',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=60, s-maxage=60',
                },
            ],
        },
    ],
    async redirects() {
        return [
            {
                source: '/demo-admin/dashboard',
                destination: '/admin',
                permanent: true,
            },
            {
                source: '/demo-agent/dashboard',
                destination: '/agent',
                permanent: true,
            },
        ];
    },
});
