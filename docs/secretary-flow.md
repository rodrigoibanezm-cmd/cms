# Secretary Flow

## Responsabilidad

```txt
Documentar el flujo real de asignación, cola y aprobación de secretaria.
```

## Estado implementado

```txt
admin asigna una OT a una secretaria
secretaria ve su propia cola por token
cola muestra pendientes y aprobadas
secretaria aprueba desde el detalle de revisión
admin conserva la OT en su listado
PDF final queda habilitado cuando existe secretary_approved_at
```

## Rutas

```txt
/admin
/admin/secretary
/admin/report?id=report_id
```

## APIs

```txt
POST /api/admin/reports/assign
POST /api/secretary/reports/id/approve
GET /api/admin/reports/id/pdf
```

## Asignación

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretary_id
tenant_id = tenant de la administrativa asignada
assigned_at = now()
report_events.event = assigned_to_secretary
```

## Cola secretaria

```txt
filtra por tenant_id
filtra por current_owner_id
incluye assigned_to_secretary
incluye secretary_approved
muestra total y pendientes
no muestra semáforo
muestra técnico desde extraction_json.tecnico
```

## Aprobación

```txt
botón Aprobar vive en /admin/report
aparece si current_state = assigned_to_secretary o admin_queue
al aprobar no se pierde la secretaria asignada
```

Cambios en reports:

```txt
current_state = secretary_approved
current_owner_type = rol aprobador
current_owner_id = user_id aprobador
secretary_approved_at = now()
approved_at = now()
last_workflow_event_at = now()
```

Evento real actual:

```txt
report_events.event = approved
```

## Admin

```txt
/admin abre por defecto en planilla
la OT aprobada sigue visible
la columna Administrativa muestra la secretaria
PDF aparece habilitado si secretary_approved_at existe
```

## PDF final

```txt
PDF final operativo
se descarga desde /api/admin/reports/id/pdf
si generated_pdf vigente existe, se reutiliza
si no existe, se genera desde XLS aprobado
```

## Pendiente

```txt
rechazo formal
edición controlada
cierre operativo
```
