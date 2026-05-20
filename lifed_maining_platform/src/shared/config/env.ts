const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] as const;

required.forEach((key) => {
  if (!import.meta.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`Отсутствует переменная окружения: ${key}`);
  }
});

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""
};
