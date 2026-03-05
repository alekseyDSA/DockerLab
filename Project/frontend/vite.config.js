import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        strictPort: true,
        allowedHosts: [  // Добавьте это
            'localhost',
            'frontend',
            'frontend-development',
            'nginx',
            'nginx-ssl-development',
            '.localhost'  // Разрешает все поддомены localhost
        ],
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 5173, // Изменено с 8080 на 5173
            clientPort: 5173 // Изменено с 8080 на 5173
        },
        watch: {
            usePolling: true,
        },
        cors: true,
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vue', 'vue-router']
                }
            }
        }
    }
})