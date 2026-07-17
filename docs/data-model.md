# Data Model

## Fuente de verdad

```txt
Neon/Postgres para estado y datos persistidos.
XLS identificado al aprobar para evidencia técnica posterior.
```

## Tablas actuales

```txt
reports
report_files
report_events
report_tenants
```

## reports

Representa una OT procesada.

Campos principales:

```txt
id, ot, source_name
status, review_status
semaforo, confidence_score
template_key, template_filename
excel_url, drive_file_id
extraction_json, error_message
created_at, updated_at
```

Campos workflow y propuesta:

```txt
current_state
current_owner_type
current_owner_id
tenant_id
assigned_at
opened_by_secretary_at
secretary_approved_at
transcription_approved_at
transcription_approved_xls_file_id
final_report_approved_at
final_report_proposal
final_report_proposal_generated_at
final_report_proposal_model
final_report_proposal_spec_version
final_report_proposal_source_file_id
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
generated_pdf
```

`transcription_approved_xls_file_id` identifica el `generated_xls` vigente al aprobar.
No cambia por regenerar archivos; solo cambia con una nueva aprobación.

Kind legacy:

```txt
generated_xls_preview
```

No se debe crear para nuevas OTs.

## report_events

Representa trazabilidad.

Eventos relevantes:

```txt
transcription_approved
final_report_proposal_generated
final_report_proposal_failed
template_changed
final_document_generated
```

`transcription_approved` registra `approved_xls_file_id`.
`final_report_proposal_generated` registra el mismo archivo fuente, modelo y especificación.

## Compatibilidad histórica

```txt
Las aprobaciones anteriores sin referencia no se completan por inferencia.
Deben aprobarse nuevamente para fijar el XLS vigente de forma explícita.
```

## Invariante

```txt
Neon guarda estado y referencias inmutables.
Drive guarda bytes de archivos.
La propuesta solo puede leer transcription_approved_xls_file_id.
No crear generated_xls_preview para nuevas OTs.
```
