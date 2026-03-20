import { tamaguiPlugin } from '@tamagui/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import { babel } from '@rollup/plugin-babel'

// Environment check
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [
    babel({
      include: /cotp\/src.*\.(js|ts)x?$/,
      babelHelpers: 'bundled',
      presets: ['module:@react-native/babel-preset'],
      plugins: [
        [
          'module:react-native-dotenv',
          {
            moduleName: 'react-native-dotenv',
            path: '../../.env.defaults',
            safe: true,
            allowUndefined: false,
          },
        ],
      ],
    }),
    react(),
    svgr(),
    nodePolyfills({
      // Exclude console from polyfills
      exclude: ['console'],
    }),
    tamaguiPlugin({
      // points to your tamagui config file
      config: 'src/tamagui.config.ts',
      // points to any linked packages or node_modules
      // that have tamagui components to optimize
      components: ['tamagui', 'ui'],
    }),
    tsconfigPaths(),
  ],

  define: {
    __DEV__: `${process.env.NODE_ENV === 'development' ? true : false}`,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
    'process.version': JSON.stringify('v0.1.0'),
  },

  // Node.js polyfills and fallbacks
  resolve: {
    alias: {
      // These modules should not be bundled
      net: 'undefined',
      tls: 'undefined',
      fs: 'undefined',

      // This makes the src directory the root for imports
      '/': path.resolve(__dirname, './src'),

      'react-native-svg': '@tamagui/react-native-svg',
    },
  },

  build: {
    // Equivalent to webpack's splitChunks configuration
    rollupOptions: {
      output: {
        manualChunks: isProduction
          ? (id) => {
              // Group node_modules into a vendor chunk
              if (id.includes('node_modules')) {
                return 'vendor'
              }
              return null
            }
          : undefined,
        chunkFileNames: isProduction ? 'assets/[name]-[hash].js' : undefined,
      },
    },
  },

  // ESLint and TypeScript checking
  server: {
    fs: {
      strict: true,
    },
  },
})
