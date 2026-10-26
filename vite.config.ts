import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// `base: './'` keeps asset URLs relative, so the build works under any
// GitHub Pages path (https://<user>.github.io/<repo>/).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
