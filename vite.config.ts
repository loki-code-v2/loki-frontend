import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikReact } from "@builder.io/qwik-react/vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
} from "fs";
import { basename, join, resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// Custom function to copy directories...
const copyDirToPublic = (
  srcDir: string,
  destDir: string,
  isInitialCall = true
) => {
  const src = resolve(__dirname, srcDir);
  const dest = resolve(__dirname, destDir);
  // Create the destination directory if it doesn't exist
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  // Copy all files and directories
  readdirSync(src).forEach((item) => {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    const stat = lstatSync(srcPath);
    if (stat.isDirectory()) {
      // If it's a directory, recursively copy it
      copyDirToPublic(srcPath, destPath, false);
    } else {
      // If it's a file, copy it
      copyFileSync(srcPath, destPath);
    }
  });
  // Log the message only for the initial call
  if (isInitialCall) {
    console.log(`Copied directory ${basename(src)} to ${destDir}`);
  }
};

export default defineConfig(() => {
  // Call the custom function
  copyDirToPublic(
    "node_modules/@shoelace-style/shoelace/cdn",
    "public/shoelace/cdn"
  );
  return {
    build: {
      sourcemap: true, // Source map generation must be turned on
    },
    // @clerk/ui lazy-loads its own internal chunks with hashed filenames;
    // Vite's dep optimizer breaks those imports. Serve it as source instead.
    optimizeDeps: {
      exclude: ["@clerk/ui"],
      include: ["hoist-non-react-statics", "glob-to-regexp", "copy-to-clipboard"],
    },
    resolve: {
      // single React copy across the app and @clerk/ui's nested deps
      dedupe: ["react", "react-dom"],
    },
    ssr: {
      external: ["node:async_hooks"],
    },
    server: {
      open: true,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      qwikReact(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "lokicode",
        project: "javascript",
      }),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
