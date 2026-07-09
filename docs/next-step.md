# Next Step

## Contexto

Tenants V1 quedó implementado y auditado.

Cambio manual de plantilla en Vista OT quedó implementado.

OT nueva queda temporalmente sin tenant hasta asignación administrativa.

## Estado validado

```txt
/api/process-report exige token de acceso
runProcessReport crea OT con tenant_id NULL
createReport permite reports.tenant_id NULL
/admin exige admin o super_admin
/admin incluye OTs del tenant y OTs sin tenant
/dashboard exige admin, super_admin o dashboard
/config exige super_admin
/admin/secretary exige administrativa o secretary
/admin/report permite admin/super_admin en OTs sin tenant
PDF final requiere OT aprobada y tenant vigente
```

## Endpoints sensibles cerrados

```txt
/admin/report
/api/admin/reports/[id]
/api/admin/reports/assign
/api/admin/reports/[id]/pdf
/api/admin/reports/[id]/template
/api/secretary/reports/[id]/approve
/api/report-file
/api/templates
```

## Regla de acceso actual

```txt
admin y super_admin ven OTs de su tenant y OTs sin tenant
administrativa y secretary ven solo current_owner_id = userId
dashboard solo ve indicadores del tenant
token transporta acceso
tenant_id y user_id no se toman desde query params como autoridad
```

## Asignación tenant

```txt
OT nueva nace con tenant_id NULL.
Admin/super_admin la ve en operación.
Al asignar administrativa, reports/files/events toman el tenant de esa administrativa.
Si admin aprueba una OT sin tenant, toma el tenant del admin.
Administrativa nunca ve OTs sin tenant.
```

## Cambio manual de plantilla

```txt
Vista OT muestra Cambiar plantilla.
Permite elegir una base existente del catálogo Drive.
Permite subir una nueva base XLSX al catálogo Drive.
Regenera XLS desde extraction_json existente.
Funciona antes o después de asignar tenant.
Registra report_events.event = template_changed.
Elimina generated_pdf previo si existía.
No reejecuta extracción IA.
No toca prompts ni matching automático.
```

## Documentación relevante

```txt
docs/tenants-v1.md
docs/current-state.md
docs/principles.md
docs/template-bases.md
```

## Deuda menor registrada

```txt
tenant_name en Vista Operación realmente representa usuario asignado
renombrar después a assigned_user_name o separar joins
normalizar role canónico administrativa y mantener secretary solo como legacy
```

## Próxima tarea sugerida

```txt
Probar flujo real en producción:
1. subir OT con token válido
2. confirmar que aparece como sin tenant en admin
3. abrir detalle OT
4. cambiar a una base existente
5. asignar administrativa
6. verificar que queda con tenant
7. aprobar
8. generar PDF vigente
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
@GitHub lee README.md, docs/principles.md, docs/tenants-v1.md y docs/next-step.md.
Audita en producción el flujo OT sin tenant hasta asignación.
Verifica listado admin, detalle, archivos, cambio plantilla, asignación y PDF vigente.
No tocar extractor, prompts ni matching automático.
Mantener archivos bajo 100 líneas.
```
