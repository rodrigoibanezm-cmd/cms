# Next Step

## Contexto

Tenants V1 quedó implementado y auditado.

Cambio manual de plantilla en Vista OT quedó implementado.

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
/admin/report filtra tenant y owner cuando corresponde
PDF final filtra tenant y owner cuando corresponde
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
admin y super_admin ven todo el tenant
administrativa y secretary ven solo current_owner_id = userId
dashboard solo ve indicadores del tenant
token transporta acceso
tenant_id y user_id no se toman desde query params como autoridad
```

## Cambio manual de plantilla

```txt
Vista OT muestra Cambiar plantilla.
Permite elegir una base existente del catálogo Drive.
Permite subir una nueva base XLSX al catálogo Drive.
Regenera XLS desde extraction_json existente.
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
2. abrir detalle OT
3. cambiar a una base existente
4. verificar XLS nuevo
5. subir nueva base XLSX desde Vista OT
6. verificar que aparece en catálogo
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
@GitHub lee README.md, docs/principles.md, docs/template-bases.md y docs/next-step.md.
Audita en producción el cambio manual de plantilla en Vista OT.
Verifica tenant, owner, regeneración XLS, evento template_changed y PDF vigente.
No tocar extractor, prompts ni matching automático.
Mantener archivos bajo 100 líneas.
```