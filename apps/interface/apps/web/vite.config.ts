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

// Tamagui's vite plugin uses import.meta.resolve which is undefined in Node 18,
// so its react-native / react-native-svg aliases silently break.
// Use explicit absolute paths so they always resolve correctly.
const rnSvgPath = path.resolve(__dirname, '../../node_modules/@tamagui/react-native-svg/dist/esm/index.mjs')
const rnWebPath = path.resolve(__dirname, '../../node_modules/react-native-web/dist/cjs/index.js')

const reactNativeFix = {
  name: 'react-native-fix',
  // configResolved runs after ALL plugin config() hooks have merged,
  // so we can safely overwrite Tamagui's broken undefined aliases.
  configResolved(config: { resolve: { alias: Array<{ find: string | RegExp; replacement: string }> } }) {
    for (const entry of config.resolve.alias) {
      if (entry.find === 'react-native-svg' || (entry.find instanceof RegExp && entry.find.test('react-native-svg'))) {
        entry.replacement = rnSvgPath
      }
      if (entry.find === 'react-native' || (entry.find instanceof RegExp && String(entry.find) === '/^react-native$/')) {
        entry.replacement = rnWebPath
      }
    }
  },
}

export default defineConfig({
  plugins: [
    reactNativeFix,
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

      'react-native-svg': rnSvgPath,
      'react-native': rnWebPath,
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

  optimizeDeps: {
    // Pre-bundle react-native-svg so Vite serves it from /__vite/deps/
    // without needing to resolve it from files outside the root.
    include: ['liveline', 'react-native-svg', '@tamagui/react-native-svg'],
    esbuildOptions: {
      plugins: [
        {
          name: 'react-native-stub',
          setup(build: { onResolve: Function; onLoad: Function }) {
            build.onResolve({ filter: /^react-native$/ }, () => ({ path: rnWebPath }))
            // Map react-native-svg → @tamagui/react-native-svg for pre-bundling
            build.onResolve({ filter: /^react-native-svg$/ }, () => ({ path: rnSvgPath }))
          },
        },
      ],
    },
  },

  server: {
    fs: {
      strict: false,
    },
  },
})
