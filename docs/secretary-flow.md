# Secretary Flow

## Responsabilidad

```txt
Documentar el flujo real de asignación, cola y aprobación de secretaria.
```

## Estado implementado

```txt
admin asigna una OT a una secretaria
secretaria ve su propia cola
cola muestra pendientes y aprobadas
secretaria aprueba desde el detalle de revisión
admin conserva la OT en su listado
PDF queda habilitado cuando existe secretary_approved_at
```

## Rutas

```txt
/admin
/admin/secretary?id=secretary_id
/admin/report?id=report_id
```

## APIs

```txt
POST /api/admin/reports/assign
POST /api/secretary/reports/id/approve
```

## Asignación

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretary_id
tenant_id = secretary_id
assigned_at = now()
report_events.event = assigned_to_secretary
```

## Cola secretaria

```txt
filtra por tenant_id
incluye assigned_to_secretary
incluye secretary_approved
muestra total y pendientes
no muestra semáforo
muestra técnico desde extraction_json.tecnico
```

## Aprobación

```txt
botón Aprobar OT vive en /admin/report
solo aparece si current_state = assigned_to_secretary
al aprobar no se pierde la secretaria asignada
```

Cambios en reports:

```txt
current_state = secretary_approved
current_owner_type = secretary
current_owner_id = secretary_id
secretary_approved_at = now()
approved_by_secretary_id = secretary_id
last_workflow_event_at = now()
```

Evento:

```txt
report_events.event = secretary_approved
```

## Admin

```txt
/admin abre por defecto en planilla
/admin?view=cards abre tarjetas
la OT aprobada sigue visible
la columna Administrativa muestra la secretaria
PDF aparece habilitado si secretary_approved_at existe
```

## Pendiente

```txt
rechazo formal
edición controlada
PDF final real
cierre operativo
```
