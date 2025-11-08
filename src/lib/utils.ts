/**
 * Shared utility functions used across the application
 */

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Convert value to integer or return default
 */
export function toInt(v: any, defaultValue: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return defaultValue;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : defaultValue;
}

/**
 * Convert value to float or return default
 */
export function toFloat(v: any, defaultValue: number | null = null): number | null {
  if (v === null || v === undefined || v === "") return defaultValue;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultValue;
}

/**
 * Convert value to string or return null if empty
 */
export function toStringOrNull(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/**
 * Convert value to boolean 0/1 for database storage
 */
export function toBool01(v: any, defaultValue: 0 | 1 = 0): 0 | 1 {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === 1 || v === "1" || v === "true" || v === "on") return 1;
  if (v === 0 || v === "0" || v === "false" || v === "off") return 0;
  return defaultValue;
}

/**
 * Ensure value is an array
 */
export function toArray<T = any>(v: any): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// ============================================================================
// Form Data Utilities
// ============================================================================

/**
 * Extract string from FormData entry or return null if empty
 */
export function formStringOrNull(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

/**
 * Extract number from FormData entry or return null if invalid
 */
export function formNumberOrNull(v: FormDataEntryValue | null): number | null {
  const s = (v ?? "").toString().trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// ============================================================================
// Display Utilities
// ============================================================================

/**
 * Display value or fallback if null/undefined/empty
 */
export function displayValue(x: unknown, fallback = "—"): string {
  return (x === null || x === undefined || x === "") ? fallback : String(x);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// ============================================================================
// ID Validation
// ============================================================================

/**
 * Assert that a value is a valid ID and throw error if not
 */
export function assertValidId(id: any, fieldName = "id"): number {
  const n = toInt(id);
  if (n === null || n <= 0) {
    throw new Error(`Valid ${fieldName} is required.`);
  }
  return n;
}

// ============================================================================
// API Utilities
// ============================================================================

/**
 * Read JSON from request with fallback for empty body
 */
export async function readJsonBody<T = any>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    // allow empty body
    return {} as T;
  }
}

/**
 * Get required field from object or throw error
 */
export function getRequired<T>(obj: any, field: string, errorMsg?: string): T {
  if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
    throw new Error(errorMsg || `${field} is required`);
  }
  return obj[field];
}

// ============================================================================
// Database Row Utilities
// ============================================================================

/**
 * Execute statement and return single row or null
 */
export function dbRowOrNull<T = any>(stmt: any, params: any[] = []): T | null {
  try {
    return stmt.get(...params) ?? null;
  } catch (err) {
    console.error("Database query error:", err);
    return null;
  }
}

/**
 * Execute statement and return array of rows
 */
export function dbList<T = any>(stmt: any, params: any[] = []): T[] {
  try {
    return stmt.all(...params) ?? [];
  } catch (err) {
    console.error("Database query error:", err);
    return [];
  }
}

// ============================================================================
// CSS Class Utilities
// ============================================================================

/**
 * Common CSS classes for consistent styling
 */
export const CSS_CLASSES = {
  // Cards and panels
  card: "rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_0_20px_rgba(0,0,0,0.25)]",
  panel: "rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-[0_0_40px_rgba(0,0,0,0.35)]",
  
  // Form controls
  input: "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-500 focus:border-amber-300/60",
  textarea: "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-500 focus:border-amber-300/60 resize-none",
  select: "rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 transition focus:border-amber-300/60",
  
  // Buttons
  button: "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition",
  buttonPrimary: "bg-amber-400 text-black hover:bg-amber-300 active:scale-[.99]",
  buttonSecondary: "border border-white/20 text-zinc-200 hover:bg-white/10",
  buttonDanger: "bg-red-500 text-white hover:bg-red-600",
  
  // Text styles
  label: "block text-sm text-zinc-300 mb-1",
  heading: "font-portcullion st-card-title-gradient text-lg",
  subheading: "text-zinc-300 text-sm",
} as const;

/**
 * Combine CSS classes with conditional logic
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}