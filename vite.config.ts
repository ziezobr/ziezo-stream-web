import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({plugins:[react()],build:{target:'chrome79',cssTarget:'chrome79'},base:process.env.GITHUB_PAGES_BASE||'/',resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},server:{host:'127.0.0.1',port:5174}});

