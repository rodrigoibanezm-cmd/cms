# Drive

## Responsabilidad

```txt
Guardar archivos originales y generados.
No decidir estado del proceso.
No ser fuente de verdad del JSON.
```

## Carpetas usadas

Entrada:

```txt
GOOGLE_DRIVE_INPUT_FOLDER_ID
```

Salida:

```txt
GOOGLE_DRIVE_OUTPUT_FOLDER_ID
```

Templates:

```txt
GOOGLE_DRIVE_TEMPLATES_FOLDER_ID
BASES_FOLDER_ID
```

Fallbacks existentes:

```txt
CANDIDATES_TEMPLATES_FOLDER_ID
```

## Autenticación

Prioridad:

```txt
1. OAuth si existen GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
2. Service account usando GOOGLE_SERVICE_ACCOUNT_JSON
```

## Archivos de entrada

```txt
original_report = foto del informe
detail_photo = fotos del equipo
```

## Archivos de salida

```txt
generated_xls = Excel final
```

## Legacy

```txt
generated_xls_preview ya no se produce.
Puede existir en OTs antiguas.
No usarlo para nuevas revisiones.
```

## Registro

Cada archivo subido a Drive debe registrarse en:

```txt
report_files
```

Con:

```txt
kind
filename
mime_type
drive_file_id
url
```

## Invariante

```txt
Si un archivo se usa para revisión, debe existir en report_files.
No depender de nombres sueltos en Drive.
No subir preview XLS para nuevas OTs.
```
