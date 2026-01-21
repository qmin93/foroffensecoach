/**
 * Supabase Client Exports
 *
 * Note: Server client and middleware are not exported here to prevent importing
 * server-only code in client components. Import directly from './server' or './middleware'.
 */

export { createClient as createBrowserClient } from './client';
