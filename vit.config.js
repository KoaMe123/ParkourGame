import { defineConfig } from 'vite';

export default defineConfig({
  root: './ParkourGame/',
  base: './',
  server: {
    open: true   // 启动后自动打开浏览器
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});