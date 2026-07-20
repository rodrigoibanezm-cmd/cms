# CMS

Digitalización auditada de informes técnicos Covaclean.

## Responsabilidad

```text
carga técnica
extracción y auditoría IA
XLS determinístico
persistencia Neon y Drive
revisión administrativa
PDF final
catálogo operativo de familias
```

## Principio central

```text
El técnico carga evidencia.
La IA extrae y audita.
Neon es fuente de verdad operacional.
Drive guarda archivos.
```

Para el catálogo:

```text
El catálogo es un artefacto derivado.
La fuente de verdad son las decisiones de catálogo.
```

## Catálogo de familias

Stage 0 quedó congelado con:

```text
557 informes
544 CONFIRMED
13 UNMAPPED
0 REVIEW
snapshot v1.0.0
```

La operación futura usa solo:

```text
CONFIRMED
PENDING_CATALOG
```

Una administrativa registra una decisión. El sistema valida, compila una versión, audita y reprocesa exclusivamente la OT afectada.

## Router documental

```text
docs/01-stage-0-discovery.md
→ histórico congelado de descubrimiento

docs/02-operational-catalog.md
→ especificación vigente del catálogo

TEMPLATE_ARCHITECTURE.md
→ arquitectura determinística de plantillas

docs/README.md
→ documentación general del sistema
```

## Infraestructura del catálogo

```text
catalog/versions/
tools/operational_catalog/
web/db/migrations/20260720_operational_catalog.sql
```

Artefactos compilados como `families.json` no se editan manualmente.

## Estado actual

```text
runtime Next.js
pipeline IA conectado
XLS desde templates Drive
reports/files/events en Neon
admin, cola y aprobación operativos
PDF final idempotente
dashboard y Config V1
infraestructura inicial del catálogo operativo
```

## Reglas de trabajo

```text
1 tarea = 1 chat
al cerrar una tarea se documenta
ningún archivo debe superar 100 líneas
1 archivo = 1 responsabilidad
no documentar visión como estado real
no agregar casuística si existe una regla general
```
