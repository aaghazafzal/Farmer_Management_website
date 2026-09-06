/**
 * Google Maps JavaScript API Asynchronous Loader
 * KisanSetu - Agricultural Procurement & Queue Management
 * 
 * Provides a resilient singleton loader for the Google Maps JS API with:
 * - Promise caching to prevent redundant script tags
 * - window.gm_authFailure capture for API key restrictions/billing issues
 * - Timeout handling for slow/offline mobile networks
 * - Clean TypeScript typing
 */

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

let mapsPromise: Promise<any> | null = null;

async function resolveMapsApiKey(apiKey?: string): Promise<string> {
  if (apiKey) return apiKey;
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }
  // Retrieve from secure backend configuration endpoint
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/config/maps`);
    if (res.ok) {
      const data = await res.json();
      if (data.apiKey) return data.apiKey;
    }
  } catch {
    // Backend may be offline in static/standalone frontend preview mode
  }
  return "";
}

export async function loadGoogleMaps(apiKey?: string): Promise<any> {
  // If already loaded and available on window
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  // If already loading, return existing promise
  if (mapsPromise) {
    return mapsPromise;
  }

  const key = await resolveMapsApiKey(apiKey);

  if (!key) {
    return Promise.reject(new Error("AIzaSyBmnpdQ3a_0DeumlqrF3jA6uXD-FuOE548"));
  }

  mapsPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only be loaded in browser environments."));
      return;
    }

    // Check if script tag already exists in document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      existingScript.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error("Google Maps loaded but window.google.maps is undefined."));
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("Failed to load Google Maps script."));
      });
      return;
    }

    // Create unique callback for clean async loading
    const callbackName = `__googleMapsInit_${Date.now()}`;
    let isSettled = false;

    // Listen for authentication or quota failures from Google
    const prevAuthFailure = window.gm_authFailure;
    window.gm_authFailure = () => {
      if (prevAuthFailure) prevAuthFailure();
      if (!isSettled) {
        isSettled = true;
        reject(new Error("Google Maps authentication failure. Please check API key restrictions or billing."));
      }
    };

    // Setup global callback
    (window as any)[callbackName] = () => {
      if (!isSettled) {
        isSettled = true;
        delete (window as any)[callbackName];
        if (window.google?.maps) {
          resolve(window.google.maps);
        } else {
          reject(new Error("Google Maps loaded without maps namespace."));
        }
      }
    };

    // Timeout in case of slow or blocked connection (15s)
    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        delete (window as any)[callbackName];
        reject(new Error("Google Maps loading timed out. Please check your network connection."));
      }
    }, 15000);

    // Create and append the script tag
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=${callbackName}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      clearTimeout(timeoutId);
      if (!isSettled) {
        isSettled = true;
        delete (window as any)[callbackName];
        reject(new Error("Network error loading Google Maps script."));
      }
    };

    document.head.appendChild(script);
  });

  return mapsPromise;
}

/**
 * Resets the cached promise (useful for Retry Map button)
 */
export function resetGoogleMapsLoader(): void {
  mapsPromise = null;
}
