# Next Step

## Contexto

El proyecto ya cuenta con workflow admin/administrativa, PDF final idempotente, Confianza IA V1, Vista Operación V1 y Config V1 inicial.

## Estado validado

```txt
README opera como router
docs/README opera como mapa documental
current-state refleja estado real
workflow mínimo persistido en reports
process-report mueve la OT a admin_queue
preview XLS eliminado
asignación de administrativa implementada
cola por administrativa implementada
cola muestra pendientes y aprobadas
aprobación de administrativa implementada
aprobación de admin implementada
PDF final descarga archivo
PDF conserva primera hoja y FOTOS
PDF no usa Google Sheets API
Confianza IA definida como KPI V1
Vista Operación V1 implementada en /admin
Config V1 implementada en /config
```

## Config V1

```txt
pantalla de configuración operacional
usa report_tenants como usuarios operativos
permite crear usuario operativo
permite activar/desactivar usuario
roles disponibles: secretary, admin, dashboard, super_admin
administrativas activas alimentan asignación de Operación
SLA, templates, tenant y mantenimiento quedan visibles como alcance V1
```

## Trazabilidad aprobación

```txt
reports.approved_at registra aprobación genérica
reports.approved_by_user_id registra quién aprobó
reports.approved_by_user_role registra admin o administrativa
approved_by_secretary_id queda solo por compatibilidad
report_events registra event=approved con payload del aprobador
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
La administrativa asignada no se borra al aprobar.
El PDF usa approved_at y mantiene compatibilidad con secretary_approved_at.
Confianza IA guía revisión, no aprueba ni rechaza.
Precisión real IA queda para V2 con approved_json.
Config V1 no implementa permisos finos ni gestión completa de usuarios.
```

## Próxima tarea

```txt
Auditar Vista Operación V1, aprobación y Config V1 en producción contra el flujo real.
```

Debe validar:

```txt
menú compacto sin sidebar permanente
/admin sigue operativa
/config abre como ruta real
crear usuario operativo funciona
activar/desactivar usuario funciona
administrativa inactiva deja de aparecer como asignable
aprobar como administrativa registra approved_by_user_role=administrativa
aprobar como admin registra approved_by_user_role=admin
PDF vacío cuando no exista
asignación de administrativa sigue operativa
```

## No hacer

```txt
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
no crear semáforo operacional V1
no implementar approved_json ni diff todavía
no convertir Config en administración externa completa
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Audita Vista Operación V1, aprobación y Config V1 en producción contra el flujo real.
No modificar extractor.
Mantener archivos bajo 100 líneas.
```
