/// <reference types="vite/client" />

declare const __BUILD_SHA__: string;

interface Window {
  __ORDERLY_METRICS__?: {
    frames: number;
    fps: number;
    updates: number;
  };
}
