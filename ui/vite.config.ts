import react from '@vitejs/plugin-react';
import { resolve } from "path";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react() as any,
        // basicSsl() as any,
    ],
    server: {
        host: "0.0.0.0",
        open: false,
        port: 3000,
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "src/setupTests",
        mockReset: true,
    },
    resolve: {
        alias: [
            { find: "@foodvibes", replacement: resolve(__dirname, "./src") },
        ],
    },
});
