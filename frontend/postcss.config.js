// postcss.config.js
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindcssPlugin from '@tailwindcss/postcss'; // Import the new plugin

export default {
  plugins: [
    tailwindcssPlugin(tailwindcss), // Use the new plugin wrapper with the tailwindcss function
    autoprefixer,
  ],
};