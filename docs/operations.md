# Operations

## Runtime

```txt
Next.js
nodejs runtime para APIs
Vercel deploy
```

## App principal

```txt
web/
```

## Scripts web

```txt
npm run dev
npm run build
npm run start
npm run lint
```

## Dependencias clave

```txt
next
react
pg
@google/genai
openai
googleapis
exceljs
xlsx-populate
```

## Env vars requeridas

Base de datos:

```txt
DATABASE_URL
```

Gemini:

```txt
GEMINI_API_KEY
GEMINI_AUDIT_MODEL
```

Drive:

```txt
GOOGLE_DRIVE_INPUT_FOLDER_ID
GOOGLE_DRIVE_OUTPUT_FOLDER_ID
GOOGLE_DRIVE_TEMPLATES_FOLDER_ID
```

Auth Drive:

```txt
GOOGLE_SERVICE_ACCOUNT_JSON
```

O:

```txt
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
```

## Archivos incluidos en build

```txt
benchmark/prompts/**
benchmark/catalog/**
```

## Operación normal

```txt
1. técnico sube informe y fotos
2. backend procesa
3. admin revisa en /admin
4. admin abre /admin/report?id={id}
```

## Invariante

```txt
No depender de archivos locales para producción.
Prompts y catálogo deben viajar en build.
Secrets viven en entorno, no en repo.
```
