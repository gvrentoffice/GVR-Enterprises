const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: false,
    reloadOnOnline: true,
    fallbacks: {
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

    // Security and cache headers
    headers: async () => [
        // Security headers for all routes
        {
            source: '/:path*',
            headers: [
                // Prevent clickjacking
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                // Prevent MIME type sniffing
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                // Enable XSS protection (legacy browsers)
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block',
                },
                // Referrer policy
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                // Permissions policy (restrict features)
                {
                    key: 'Permissions-Policy',
                    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
                },
                // Content Security Policy
                {
                    key: 'Content-Security-Policy',
                    value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://www.googletagmanager.com https://www.google.com https://apis.google.com",
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                        "font-src 'self' https://fonts.gstatic.com data:",
                        "img-src 'self' data: blob: https: http:",
                        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
                        "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com https://recaptcha.google.com",
                        "object-src 'none'",
                        "base-uri 'self'",
                        "form-action 'self'",
                        "frame-ancestors 'none'",
                        "upgrade-insecure-requests"
                    ].join('; '),
                },
            ],
        },
        // Cache headers for static assets
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
