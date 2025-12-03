import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only process node_modules
          if (!id.includes('node_modules')) {
            return
          }

          // Separate React DOM first (more specific)
          if (id.includes('react-dom')) {
            return 'react-dom-vendor'
          }
          
          // Separate React core (only the main react package)
          if (id.includes('/react/') && !id.includes('react-dom') && !id.includes('react-hook-form')) {
            return 'react-vendor'
          }
          if (id.endsWith('/react') && !id.includes('react-dom')) {
            return 'react-vendor'
          }

          // Group all Radix UI packages
          if (id.includes('@radix-ui/')) {
            return 'radix-ui'
          }

          // Group chart libraries
          if (id.includes('recharts') || id.includes('@tanstack/react-table')) {
            return 'charts-vendor'
          }

          // Group animation libraries
          if (id.includes('framer-motion') || id.includes('embla-carousel')) {
            return 'animation-vendor'
          }

          // Group form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod')) {
            return 'form-vendor'
          }

          // Group date libraries
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-vendor'
          }

          // Group icon libraries
          if (id.includes('lucide-react') || id.includes('@tabler/icons')) {
            return 'icons-vendor'
          }

          // Group UI utility libraries
          if (id.includes('class-variance-authority') || id.includes('/clsx') || id.includes('tailwind-merge')) {
            return 'ui-utils'
          }

          // Group drag and drop
          if (id.includes('@dnd-kit')) {
            return 'dnd-vendor'
          }

          // Group other utilities
          if (id.includes('/cmdk') || id.includes('/sonner') || id.includes('/vaul') || id.includes('next-themes')) {
            return 'utils-vendor'
          }

          // Group Tailwind and related
          if (id.includes('@tailwindcss') || id.includes('tailwindcss')) {
            return 'tailwind-vendor'
          }

          // For any other node_modules, group by package scope or name
          const match = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
          if (match) {
            const packageName = match[1]
            // Group scoped packages by scope
            if (packageName.startsWith('@')) {
              const scope = packageName.split('/')[0].replace('@', '')
              return `vendor-${scope}`
            }
            // For other packages, group into vendor-other
            return 'vendor-other'
          }

          return 'vendor-misc'
        },
      },
    },
    chunkSizeWarningLimit: 700, // React 19 is inherently large (~692KB), this is acceptable for a core framework
  },
})