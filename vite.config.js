import { defineConfig } from 'vite';
import { resolve } from 'path';
const p = (f) => resolve(__dirname, f);
export default defineConfig({
  server: { port: 5173, host: true },
  build: { rollupOptions: { input: {
    index: p('index.html'), courses: p('courses.html'), course: p('course.html'),
    auth: p('auth.html'), mini: p('mini-lectures.html'), resources: p('resources.html') } } },
});
