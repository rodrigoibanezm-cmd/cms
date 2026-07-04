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

Campos workflow:

```txt
current_state
current_owner_type
current_owner_id
assigned_at
opened_by_secretary_at
secretary_approved_at
closed_at
priority
sla_due_at
last_workflow_event_at
approved_by_secretary_id
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
workflow_processing_started
workflow_admin_queue
workflow_error
```

## Estado operacional

```txt
status = procesamiento técnico
review_status = revisión admin/auditor
current_state = ubicación operacional de la OT
current_owner_type = tipo de actor que tiene la OT
current_owner_id = actor específico, cuando existe
```

## Invariante

```txt
Neon guarda estado y JSON.
Drive guarda bytes de archivos.
El admin debe leer desde Neon, no reconstruir desde Drive.
No crear generated_xls_preview para nuevas OTs.
Cada OT debe saber dónde está y quién la tiene.
```