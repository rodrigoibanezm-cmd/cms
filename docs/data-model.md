# Data Model

## Fuente de verdad

```txt
Neon/Postgres
```

## Tablas actuales

```txt
reports
report_files
report_events
```

## reports

Representa una OT procesada.

Campos principales:

```txt
id
ot
source_name
status
review_status
semaforo
confidence_score
template_key
template_filename
excel_url
drive_file_id
extraction_json
admin_corrections
critical_checks
admin_notes
approved_at
approved_by
rejected_at
rejected_reason
error_message
created_at
updated_at
```

## report_files

Representa archivos asociados a una OT.

Kinds actuales:

```txt
original_report
detail_photo
generated_xls
```

Kind legacy:

```txt
generated_xls_preview
```

No se debe crear para nuevas OTs.

## report_events

Representa trazabilidad.

Eventos actuales observados:

```txt
uploaded
extracted
xls_generated
audit_completed
error
```

## Estado operacional

```txt
status = procesamiento técnico
review_status = revisión admin/auditor
```

## Invariante

```txt
Neon guarda estado y JSON.
Drive guarda bytes de archivos.
El admin debe leer desde Neon, no reconstruir desde Drive.
No crear generated_xls_preview para nuevas OTs.
```
