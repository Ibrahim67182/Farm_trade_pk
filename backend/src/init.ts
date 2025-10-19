// src/lib/init.ts

// automatically seeds the commodities one time when app runs 
import { seed_commodities } from "../lib/seed/commodities-seed";

let initialized = false; // prevent double calls in hot reload

export async function initApp() {
  if (initialized) return;
  initialized = true;

  await seed_commodities();
}
