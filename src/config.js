// Fill these in to turn on real sign-up / login (Supabase) and Discord notifications.
// Leave url empty = demo mode (site stays open, no login required).
export const AUTH = {
  url: '',          // e.g. 'https://xxxx.supabase.co'
  anonKey: '',      // Supabase "anon public" key (safe to expose)
  notifyUrl: '/api/notify', // serverless function that posts to Discord
};
