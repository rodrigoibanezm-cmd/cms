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
Permitir OTs nuevas temporalmente sin tenant hasta asignación.
```

## Modelo

```txt
tenant_id = organización operativa
user_id = usuario dentro del tenant
role = permiso del usuario
current_owner_id = usuario asignado a la OT
reports.tenant_id NULL = OT nueva pendiente de asignación
```

## Invariantes

```txt
Toda operación autenticada obtiene acceso desde requireTenantAccess().
Nunca se acepta tenant_id desde query/body como autoridad.
Admin y super_admin ven OTs de su tenant y OTs sin tenant.
Las administrativas solo ven OTs con tenant y current_owner_id propio.
La asignación de administrativa fija tenant_id en reports/files/events.
```

## Roles V1

```txt
super_admin   configuración y operación completa del tenant
admin         operación completa del tenant
dashboard     solo indicadores del tenant
administrativa cola propia y aprobación de OTs asignadas
secretary      alias legacy de administrativa
```

## Token y autoridad

```txt
tenant_access_tokens guarda token_hash, no token plano.
El token puede viajar por query param, header x-tenant-token o Bearer.
requireTenantAccess devuelve tenantId, userId y role.
requireRole valida permiso por ruta.
Query params pueden transportar token, no decidir tenant ni actor.
```

## Entrada del sistema

```txt
/api/process-report exige token de acceso.
La OT nace con reports.tenant_id NULL.
runProcessReport crea la OT sin tenant operativo.
report_files y report_events nacen sin tenant mientras la OT no se asigne.
```

## Operación y colas

```txt
/admin exige admin o super_admin.
listReports incluye OTs del tenant y OTs sin tenant para admin/super_admin.
Las administrativas asignables salen de tenant_access_tokens activas.
/admin/secretary exige administrativa o secretary.
La cola administrativa filtra por tenant_id y current_owner_id.
```

## Detalle, archivos y PDF

```txt
/admin/report exige token.
/api/admin/reports/[id] exige token.
/api/report-file exige token.
/api/admin/reports/[id]/pdf exige token.
admin y super_admin acceden a OTs del tenant y OTs sin tenant.
administrativa/secretary acceden solo si current_owner_id = userId.
El PDF final requiere OT aprobada y tenant vigente.
```

## Aprobación y Config

```txt
El form de aprobación no manda tenant_id.
La aprobación usa approveReportWithAccess.
Admin puede aprobar OTs del tenant o sin tenant.
Si admin aprueba una OT sin tenant, toma el tenant del admin.
Administrativa solo puede aprobar OTs asignadas a su userId.
/config exige super_admin.
Crear usuario genera token y link de acceso para copiar/pegar.
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
[x] OT sin tenant hasta asignación
```

## Deuda menor

```txt
tenant_name en Vista Operación representa usuario asignado.
Renombrar a assigned_user_name o separar joins.
Normalizar role canónico administrativa y mantener secretary solo como legacy.
```
