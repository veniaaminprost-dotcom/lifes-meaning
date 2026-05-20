import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const supabaseUrl = requiredEnv("VITE_SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const ownerEmail = requiredEnv("OWNER_EMAIL");
const ownerPassword = requiredEnv("OWNER_PASSWORD");
const ownerDisplayName = process.env.OWNER_DISPLAY_NAME ?? "Veniamin";

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const findUserByEmail = async (email) => {
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 100
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((currentUser) => currentUser.email === email);

    if (user || data.users.length < 100) {
      return user ?? null;
    }

    page += 1;
  }
};

const upsertOwnerProfile = async (userId) => {
  const { error } = await supabaseAdmin.from("profiles").upsert({
    user_id: userId,
    role: "admin",
    display_name: ownerDisplayName
  });

  if (error) {
    throw error;
  }
};

const existingUser = await findUserByEmail(ownerEmail);

if (existingUser) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
    email_confirm: true,
    password: ownerPassword,
    app_metadata: {
      ...existingUser.app_metadata,
      role: "admin"
    },
    user_metadata: {
      ...existingUser.user_metadata,
      display_name: existingUser.user_metadata?.display_name ?? ownerDisplayName
    }
  });

  if (error) {
    throw error;
  }

  await upsertOwnerProfile(data.user.id);
  console.log(`Owner account updated: ${ownerEmail}`);
} else {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    app_metadata: {
      role: "admin"
    },
    user_metadata: {
      display_name: ownerDisplayName
    }
  });

  if (error) {
    throw error;
  }

  await upsertOwnerProfile(data.user.id);
  console.log(`Owner account created: ${ownerEmail}`);
}
