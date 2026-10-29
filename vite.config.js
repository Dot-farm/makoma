import { defineConfig } from 'vite';

const previewHost = '3000-iyvvn76gcgj09kx1zcnic-38259f49.us4.manus.computer';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [previewHost],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [previewHost],
  },
});
