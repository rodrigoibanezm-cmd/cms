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
```

## Deuda menor registrada

```txt
tenant_name en Vista Operación realmente representa usuario asignado
renombrar después a assigned_user_name o separar joins
normalizar role canónico administrativa y mantener secretary solo como legacy
```

## Próxima tarea sugerida

```txt
Probar flujo real en producción con token:
1. crear administrativa desde Config
2. copiar link generado
3. subir una OT con token válido
4. verificar que nace con tenant_id
5. asignarla desde /admin
6. abrirla desde cola administrativa
7. aprobar
8. descargar PDF
```

## No hacer todavía

```txt
no tocar extractor
no tocar prompts
no cambiar render XLS
no implementar approved_json
no hacer refactor grande de usuarios/tenants
no cambiar modelo report_tenants todavía
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/principles.md, docs/tenants-v1.md y docs/next-step.md.
Audita el flujo real Tenants V1 en producción con una OT nueva.
No tocar extractor ni render XLS.
Mantener archivos bajo 100 líneas.
```
