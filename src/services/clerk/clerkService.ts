import { Clerk } from "@clerk/clerk-js";
import { ui as clerkUiBundle } from "@clerk/ui";

class ClerkService extends Clerk {
  private static instance: ClerkService;
  // Memoize the in-flight load() so concurrent callers (page-load init + a fast
  // click) share ONE load. Two concurrent load() calls on clerk-js can deadlock
  // silently — the modal then never opens and nothing is logged.
  private static loadPromise: Promise<ClerkService> | null = null;
  private constructor() {
    const clerkKey: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    console.debug("[loki] Clerk: constructing with", clerkKey?.slice(0, 12));
    // clerk-js v6: constructor takes only key/domain; UI components are passed to load()
    super(clerkKey);
  }
  public static async getInstance(): Promise<ClerkService> {
    if (!ClerkService.instance) {
      ClerkService.instance = new ClerkService();
    }
    const svc = ClerkService.instance;
    if (!svc.loaded) {
      if (!ClerkService.loadPromise) {
        ClerkService.loadPromise = (async () => {
          console.debug("[loki] Clerk: load() starting");
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Clerk load timed out after 20s")), 20000),
          );
          // v6 is headless by default: inject the bundled UI explicitly
          await Promise.race([svc.load({ ui: clerkUiBundle }), timeout]);
          console.debug("[loki] Clerk: load() finished");
          return svc;
        })().catch((err) => {
          console.error("[loki] Clerk: load() FAILED:", err);
          ClerkService.loadPromise = null; // allow a retry on the next click
          throw err;
        });
      }
      await ClerkService.loadPromise;
    }
    return svc;
  }
}

export default ClerkService;
