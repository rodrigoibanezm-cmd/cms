# Google Drive para plantillas CMS
pasos, ahora si
## Estructura Drive

Carpeta raíz: `CMS`

```text
CMS/
  bases/
  plantillas rescatadas/
  benchmark/
  output/
```

IDs registrados en `config/drive-folders.json`.

## Regla de archivos

- Drive se usa como almacenamiento.
- Los Excel se mantienen como `.xlsx`.
- No convertir a Google Sheets.
- Los certificados no se usan como plantilla.
- Las plantillas rescatadas salen desde archivos cuyo nombre contiene `INFORM` y termina en `.xlsx`.

## Flujo actual

1. `bases/` contiene los XLS oficiales existentes.
2. `plantillas rescatadas/` recibe informes digitados usados como semillas de plantillas faltantes.
3. Luego se revisa familia por familia.
4. Las plantillas aprobadas alimentan el catálogo `template_key -> file_id`.

## Subida local de informes digitados

Desde la repo local:

```powershell
node scripts/upload_drive_reports.js "C:\Rodrigo\NexusG\Marcelo\OneDrive_1_24-06-2026"
```

El script busca recursivamente todos los `.xlsx` que contienen `INFORM` y excluye `CERTIFICADO`.

## Autenticación local

El script usa `googleapis` y requiere credenciales locales de Google.

Opción simple para desarrollo:

```powershell
gcloud auth application-default login
```

Si no está disponible `gcloud`, usar una credencial local y definir:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\credenciales.json"
```
