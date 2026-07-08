# Tenants V1

## Estado

```txt
implementado y auditado V1
```

## Objetivo

```txt
Separar operación por tenant.
Evitar que tenant_id, user_id o id desde query/body sean autoridad.
Usar token como transporte de acceso.
Mantener trazabilidad en reports, report_files y report_events.
```

## Modelo operativo

```txt
tenant_id = organización / empresa operativa
user_id = usuario dentro del tenant
role = permiso del usuario
current_owner_id = usuario asignado a la OT
```

## Invariantes

```txt
Toda operación autenticada obtiene tenantId desde requireTenantAccess().
Nunca se acepta tenant_id desde query/body como autoridad.
Toda query operacional debe filtrar por tenant_id.
Las administrativas, además, deben filtrar por current_owner_id.
```

## Roles V1

```txt
super_admin   configuración y operación completa del tenant
admin         operación completa del tenant
dashboard     solo indicadores del tenant
administrativa cola propia y aprobación de OTs asignadas
secretary      alias legacy de administrativa
```

## Token de acceso

```txt
tenant_access_tokens guarda token_hash, no token plano.
El token puede viajar por query param, header x-tenant-token o Bearer.
requireTenantAccess devuelve tenantId, userId y role.
requireRole valida permiso por ruta.
```

## Regla de autoridad

```txt
Query params pueden transportar token.
Query params no deciden tenant ni usuario actor.
tenantId y userId vienen desde requireTenantAccess.
```

## Entrada del sistema

```txt
/api/process-report exige token tenant.
runProcessReport exige tenantId.
createReport inserta reports.tenant_id.
report_files y report_events heredan tenant desde reports si no se pasa explícito.
```

## Operación y colas

```txt
/admin exige admin o super_admin.
listReports filtra por access.tenantId.
Las administrativas asignables salen de tenant_access_tokens activas del mismo tenant.
/admin/secretary exige administrativa o secretary.
La cola administrativa filtra por tenant_id y current_owner_id.
```

## Detalle, archivos y PDF

```txt
/admin/report exige token.
/api/admin/reports/[id] exige token.
/api/report-file exige token.
/api/admin/reports/[id]/pdf exige token.
admin y super_admin acceden a OTs del tenant.
administrativa/secretary acceden solo si current_owner_id = userId.
```

## Aprobación

```txt
El form de aprobación no manda tenant_id.
La aprobación usa approveReportWithAccess.
Admin puede aprobar OTs del tenant.
Administrativa solo puede aprobar OTs asignadas a su userId.
El evento approved guarda approved_by_user_id y approved_by_user_role.
```

## Config V1

```txt
/config exige super_admin.
Crear usuario genera token de acceso una sola vez.
El link generado se muestra para copiar/pegar.
La gestión usa report_tenants como catálogo operativo de usuarios V1.
```

## Checklist de auditoría V1

```txt
[x] Process-report
[x] Admin
[x] Dashboard
[x] Config
[x] Cola administrativa
[x] Detalle OT
[x] API detalle
[x] Archivos
[x] PDF
[x] Aprobación
```

## Deuda menor

```txt
En listReports, tenant_name actualmente representa el usuario asignado.
Renombrar a assigned_user_name o separar dos joins.
Normalizar role canónico administrativa y mantener secretary solo como legacy.
```
