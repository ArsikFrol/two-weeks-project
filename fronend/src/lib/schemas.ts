import z from "zod";

export const editProfile = z.object({
    name: z.string()
        .trim()
        .min(1, 'Введите имя')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя слишком длинное')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+(-[А-ЯЁа-яёA-Za-z]+)*$/,
            'Имя может содержать только буквы и дефис'
        ),

    userName: z.string()
        .trim()
        .toLowerCase()
        .min(1, 'Введите логин')
        .min(3, 'Логин должен содержать минимум 3 символа')
        .max(30, 'Логин слишком длинный')
        .regex(
            /^@?[a-z0-9_]+$/,
            'Логин может содержать только латиницу, цифры и _'
        )
        .transform((v) => v.startsWith('@') ? v : `@${v}`),

    description: z.string()
        .trim()
        .min(1, 'Введите описание')
        .min(10, 'Описание должно содержать минимум 10 символов')
        .max(500, 'Описание слишком длинное (максимум 500 символов)'),
})


export type EditProfileZod = z.infer<typeof editProfile>

export const signInSchema = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .min(5, 'Email слишком короткий')
        .max(254, 'Email слишком длинный')
        .email('Введите корректный email'),

    password: z.string()
        .min(8, 'Пароль должен быть минимум 8 символов')
        .max(100, 'Пароль слишком длинный')
        .regex(/[A-Z]/, 'Добавьте хотя бы одну заглавную букву')
        .regex(/[a-z]/, 'Добавьте хотя бы одну строчную букву')
        .regex(/\d/, 'Добавьте хотя бы одну цифру')
        .regex(/[^A-Za-z0-9]/, 'Добавьте хотя бы один спецсимвол'),
})

export type SignInlForm = z.infer<typeof signInSchema>

export const placeFormSchema = z.object({
    firstName: z.string()
        .trim()
        .min(1, 'Введите имя')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя слишком длинное')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+(-[А-ЯЁа-яёA-Za-z]+)*$/,
            'Имя может содержать только буквы и дефис'
        ),

    lastName: z.string()
        .trim()
        .min(1, 'Введите фамилию')
        .min(2, 'Фамилия должна содержать минимум 2 символа')
        .max(50, 'Фамилия слишком длинная')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+(-[А-ЯЁа-яёA-Za-z]+)*$/,
            'Фамилия может содержать только буквы и дефис'
        ),

    country: z.string()
        .trim()
        .min(1, 'Введите название страны')
        .min(2, 'Название слишком короткое')
        .max(100, 'Название слишком длинное')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+([ -][А-ЯЁа-яёA-Za-z]+)*$/,
            'Название может содержать только буквы, пробел и дефис'
        ),
    countrySlug: z.string(),

    city: z.string()
        .trim()
        .min(1, 'Введите название города')
        .min(2, 'Название слишком короткое')
        .max(100, 'Название слишком длинное')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+([ -][А-ЯЁа-яёA-Za-z]+)*$/,
            'Название может содержать только буквы, пробел и дефис'
        ),
    citySlug: z.string(),

    min: z
        .number({ message: 'Введите число' })
        .int('Только целое число')
        .min(0, 'Минимум 0')
        .max(10_000_000, 'Слишком большое число'),

    max: z
        .number({ message: 'Введите число' })
        .int('Только целое число')
        .min(0, 'Минимум 0')
        .max(10_000_000, 'Слишком большое число'),

    date: z
        .date({ message: 'Выберите дату' })
        .refine((d) => d >= new Date(new Date().setHours(0, 0, 0, 0)), {
            message: 'Дата не может быть в прошлом',
        }),

    time: z
        .string()
        .min(1, 'Выберите время'),

    atmosphere: z
        .string()
        .min(1, 'Выберите атмосферу'),

    person: z
        .string()
        .min(1, 'Выберите, с кем встреча'),

    meeting: z
        .string()
        .min(1, 'Выберите, с кем встреча'),
})
    .refine((data) => data.min <= data.max, {
        message: 'Минимум больше максимума',
        path: ['max'],
    })

export type PlaceFormSchema = z.infer<typeof placeFormSchema>

export const signUpForm = z.object({
    email: z.string()
        .trim()
        .toLowerCase()
        .min(5, 'Email слишком короткий')
        .max(254, 'Email слишком длинный')
        .email('Введите корректный email'),

    password: z.string()
        .min(8, 'Пароль должен быть минимум 8 символов')
        .max(100, 'Пароль слишком длинный')
        .regex(/[A-Z]/, 'Добавьте хотя бы одну заглавную букву')
        .regex(/[a-z]/, 'Добавьте хотя бы одну строчную букву')
        .regex(/\d/, 'Добавьте хотя бы одну цифру')
        .regex(/[^A-Za-z0-9]/, 'Добавьте хотя бы один спецсимвол'),

    name: z.string()
        .trim()
        .min(1, 'Введите имя')
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя слишком длинное')
        .regex(
            /^[А-ЯЁа-яёA-Za-z]+(-[А-ЯЁа-яёA-Za-z]+)*$/,
            'Имя может содержать только буквы и дефис'
        ),
})

export type SignUpSchema = z.infer<typeof signUpForm>