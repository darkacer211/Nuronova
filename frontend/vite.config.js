import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiKey =
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    '';
  const groqKey =
    process.env.VITE_GROQ_API_KEY ||
    process.env.GROQ_API_KEY ||
    env.VITE_GROQ_API_KEY ||
    env.GROQ_API_KEY ||
    '';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
    },
  };
});

