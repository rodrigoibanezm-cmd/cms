# Next Step

## Contexto

Tenants V1 quedó implementado y auditado.

## Estado validado

```txt
/api/process-report exige token tenant
runProcessReport exige tenantId
createReport inserta reports.tenant_id
/admin exige admin o super_admin
/admin no acepta tenant_id desde query como autoridad
/dashboard exige admin, super_admin o dashboard
/config exige super_admin
/admin/secretary exige administrativa o secretary
```

## Endpoints sensibles cerrados

```txt
/admin/report
/api/admin/reports/[id]
/api/admin/reports/assign
/api/admin/reports/[id]/pdf
/api/secretary/reports/[id]/approve
/api/report-file
```

## Regla de acceso actual

```txt
admin y super_admin ven todo el tenant
administrativa y secretary ven solo current_owner_id = userId
dashboard solo ve indicadores del tenant
token transporta acceso
tenant_id y user_id no se toman desde query params como autoridad
```

## Documentación relevante

```txt
docs/tenants-v1.md
docs/current-state.md
docs/principles.md
docs/template-bases.md
```

## Decisión pendiente anotada

```txt
Vista OT debe permitir cambiar plantilla cuando el matching falle en borde.
Debe existir botón Cambiar plantilla en el detalle OT.
Debe permitir elegir una base existente del catálogo.
Debe permitir agregar una nueva base XLSX al catálogo.
El cambio debe regenerar XLS determinístico y registrar evento.
No debe tocar extractor, prompts ni matching automático todavía.
```

## Deuda menor registrada

```txt
tenant_name en Vista Operación realmente representa usuario asignado
renombrar después a assigned_user_name o separar joins
normalizar role canónico administrativa y mantener secretary solo como legacy
```

## Próxima tarea sugerida

```txt
Diseñar e implementar cambio manual de plantilla en Vista OT:
1. listar bases disponibles
2. seleccionar nueva base para la OT
3. opcionalmente subir nueva base al catálogo
4. regenerar XLS desde JSON existente
5. registrar cambio en report_events
6. invalidar PDF anterior si existía
```

## No hacer todavía

```txt
no tocar extractor
no tocar prompts
no cambiar matching automático
no implementar approved_json
no hacer refactor grande de usuarios/tenants
no cambiar modelo report_tenants todavía
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/principles.md, docs/template-bases.md y docs/next-step.md.
Implementa botón Cambiar plantilla en Vista OT.
Debe elegir base existente o agregar nueva base al catálogo.
Regenera XLS desde JSON existente, registra evento e invalida PDF anterior.
No tocar extractor, prompts ni matching automático.
Mantener archivos bajo 100 líneas.
```