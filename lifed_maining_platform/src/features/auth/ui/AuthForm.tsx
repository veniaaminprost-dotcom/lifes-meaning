import { zodResolver } from "@hookform/resolvers/zod";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { Alert, Button, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";

const optionalString = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const phoneRegex = /^\+?[0-9()\-\s]{7,20}$/;
const telegramRegex = /^(@[a-zA-Z0-9_]{5,}|https?:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]+\/?)$/i;
const maxRegex = /^(@[a-zA-Z0-9._-]{3,}|https?:\/\/([a-z0-9-]+\.)?max\.ru\/[^\s]+)$/i;
const vkRegex = /^(@[a-zA-Z0-9._-]{3,}|https?:\/\/(vk\.com|vk\.ru)\/[^\s]+)$/i;

const validateMessengerContact = (
  messengerType: "telegram" | "max" | "vk",
  messengerContact: string
) => {
  if (messengerType === "telegram") {
    return telegramRegex.test(messengerContact);
  }
  if (messengerType === "max") {
    return maxRegex.test(messengerContact);
  }
  return vkRegex.test(messengerContact);
};

const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  displayName: z.preprocess(
    optionalString,
    z.string().min(2, "Минимум 2 символа").optional()
  ),
  phone: z.preprocess(optionalString, z.string().optional()),
  messengerType: z.preprocess(optionalString, z.enum(["telegram", "max", "vk"]).optional()),
  messengerContact: z.preprocess(optionalString, z.string().optional()),
  gender: z.preprocess(optionalString, z.enum(["male", "female", "unknown"]).optional()),
  religionRelation: z.preprocess(optionalString, z.enum(["atheist", "christian", "muslim", "other"]).optional()),
  christianBranch: z.preprocess(optionalString, z.enum(["orthodox", "catholic", "protestant"]).optional()),
  christianConfession: z.preprocess(optionalString, z.string().optional()),
  religionOther: z.preprocess(optionalString, z.string().optional())
});

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  displayName: z.string().trim().min(2, "Минимум 2 символа"),
  phone: z.string().trim().regex(phoneRegex, "Введите корректный номер телефона"),
  gender: z.enum(["male", "female", "unknown"], { message: "Выберите пол" }),
  messengerType: z.enum(["telegram", "max", "vk"], { message: "Выберите мессенджер" }),
  messengerContact: z.string().trim().min(2, "Укажите Telegram или ссылку на мессенджер"),
  religionRelation: z.enum(["atheist", "christian", "muslim", "other"], { message: "Выберите отношение к религии" }),
  christianBranch: z.preprocess(optionalString, z.enum(["orthodox", "catholic", "protestant"]).optional()),
  christianConfession: z.preprocess(optionalString, z.string().optional()),
  religionOther: z.preprocess(optionalString, z.string().optional())
}).superRefine((values, ctx) => {
  const isValid = validateMessengerContact(values.messengerType, values.messengerContact);
  if (!isValid) {
    const message =
      values.messengerType === "telegram"
        ? "Введите @username или ссылку вида https://t.me/username"
        : values.messengerType === "max"
          ? "Введите @username или ссылку на профиль в Max"
          : "Введите @username или ссылку на профиль VK";

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: ["messengerContact"]
    });
  }

  if (values.religionRelation === "christian" && !values.christianBranch) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Выберите направление христианства",
      path: ["christianBranch"]
    });
  }

  if (values.religionRelation === "christian" && values.christianBranch === "protestant" && !values.christianConfession?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Укажите вашу конфессию",
      path: ["christianConfession"]
    });
  }

  if (values.religionRelation === "other" && !values.religionOther?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Укажите ваше вероисповедание",
      path: ["religionOther"]
    });
  }
});

export type AuthFormValues = z.infer<typeof registerSchema> & {
  displayName?: string;
  phone?: string;
  messengerType?: "telegram" | "max" | "vk";
  messengerContact?: string;
  gender?: "male" | "female" | "unknown";
  religionRelation?: "atheist" | "christian" | "muslim" | "other";
  christianBranch?: "orthodox" | "catholic" | "protestant";
  christianConfession?: string;
  religionOther?: string;
};

interface AuthFormProps {
  mode: "login" | "register";
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

export const AuthForm = ({ mode, loading, error, onSubmit }: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "register" ? registerSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      phone: "",
      messengerType: undefined,
      messengerContact: "",
      gender: undefined,
      religionRelation: undefined,
      christianBranch: undefined,
      christianConfession: "",
      religionOther: ""
    }
  });
  const messengerType = watch("messengerType");
  const religionRelation = watch("religionRelation");
  const christianBranch = watch("christianBranch");

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      {mode === "register" && (
        <TextField
          label="Имя"
          {...register("displayName")}
          error={Boolean(errors.displayName)}
          helperText={errors.displayName?.message}
        />
      )}
      {mode === "register" && (
        <TextField label="Телефон" placeholder="+7 999 123-45-67" {...register("phone")} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
      )}
      {mode === "register" && (
        <TextField
          select
          label="Пол"
          {...register("gender")}
          error={Boolean(errors.gender)}
          helperText={errors.gender?.message}
        >
          <MenuItem value="female">Женщина</MenuItem>
          <MenuItem value="male">Мужчина</MenuItem>
          <MenuItem value="unknown">Не хочу указывать</MenuItem>
        </TextField>
      )}
      {mode === "register" && (
        <>
          <TextField
            select
            label="Отношение к религии"
            {...register("religionRelation")}
            error={Boolean(errors.religionRelation)}
            helperText={errors.religionRelation?.message}
          >
            <MenuItem value="atheist">Атеист</MenuItem>
            <MenuItem value="christian">Христианин</MenuItem>
            <MenuItem value="muslim">Мусульманин</MenuItem>
            <MenuItem value="other">Другое</MenuItem>
          </TextField>
          {religionRelation === "christian" && (
            <TextField
              select
              label="Направление христианства"
              {...register("christianBranch")}
              error={Boolean(errors.christianBranch)}
              helperText={errors.christianBranch?.message}
            >
              <MenuItem value="orthodox">Православный</MenuItem>
              <MenuItem value="catholic">Католик</MenuItem>
              <MenuItem value="protestant">Протестант</MenuItem>
            </TextField>
          )}
          {religionRelation === "christian" && christianBranch === "protestant" && (
            <TextField
              label="Конфессия"
              placeholder="Например: баптист, пятидесятник, адвентист..."
              {...register("christianConfession")}
              error={Boolean(errors.christianConfession)}
              helperText={errors.christianConfession?.message}
            />
          )}
          {religionRelation === "other" && (
            <TextField
              label="Уточните вероисповедание"
              {...register("religionOther")}
              error={Boolean(errors.religionOther)}
              helperText={errors.religionOther?.message}
            />
          )}
          <TextField select label="Мессенджер для связи" {...register("messengerType")} error={Boolean(errors.messengerType)} helperText={errors.messengerType?.message}>
            <MenuItem value="telegram">Telegram</MenuItem>
            <MenuItem value="max">Max</MenuItem>
            <MenuItem value="vk">VK</MenuItem>
          </TextField>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              Контакт для обратной связи
            </Typography>
            <Tooltip title="Это нужно, чтобы вы могли быстро задать вопрос по курсу и получить обратную связь от куратора.">
              <IconButton size="small" aria-label="Зачем нужен контакт">
                <HelpOutlineIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
          <TextField
            label={
              messengerType === "max"
                ? "Max (@username или ссылка)"
                : messengerType === "vk"
                  ? "VK (@username или ссылка)"
                  : "Telegram (@username или ссылка)"
            }
            placeholder={
              messengerType === "max"
                ? "@nickname или https://max.ru/..."
                : messengerType === "vk"
                  ? "@nickname или https://vk.com/..."
                  : "@username или https://t.me/..."
            }
            {...register("messengerContact")}
            error={Boolean(errors.messengerContact)}
            helperText={errors.messengerContact?.message}
          />
        </>
      )}
      <TextField label="Email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
      <TextField
        label="Пароль"
        type="password"
        {...register("password")}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {mode === "login" ? "Войти" : "Создать аккаунт"}
      </Button>
    </Stack>
  );
};
