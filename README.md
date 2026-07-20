# CMS
Digitalización auditada de informes técnicos Covaclean.

## Responsabilidad
```txt
front técnico de carga
api process-report
pipeline de extracción IA
generación XLS determinística
subida de archivos a Drive
persistencia Neon
admin de revisión
auditoría IA
workflow admin/secretaria
PDF final desde XLS aprobado
```

## Arquitectura de plantillas

La definición central está en:

```txt
TEMPLATE_ARCHITECTURE.md
```

Flujo objetivo:

```txt
informes reales
→ inventario
→ inferencia determinística de familias
→ CONFIRMED / REVIEW / UNMAPPED
→ validación con evidencia
→ catálogo versionado
→ extracción estructurada
→ render determinístico
```

Principios:

```txt
el informe original es evidencia
el maestro aprobado define la estructura visual
el catálogo define familia, aliases y versión
la IA extrae semántica a JSON cerrado
el renderer escribe el XLS sin decisiones del LLM
Neon guarda estado y trazabilidad
Drive guarda originales, maestros y generados
```

Stage 0 convive con producción y no reemplaza todavía el renderer actual.

## Fuera de esta repo
```txt
ERP
BI histórico avanzado
gestión completa de usuarios
firma documental final externa
workflow operativo externo a la revisión admin
```

## Estado actual
```txt
runtime Next.js
pipeline IA conectado
XLS generado desde templates Drive
reports/files/events guardados en Neon
admin visual operativo
asignación y cola de secretaria operativas
aprobación secretaria operativa
PDF final idempotente operativo
Confianza IA disponible como KPI V1
dashboard operativo V1
Config V1 operativa en /config
```

## Diseño visual
```txt
docs/ui-design-system.md
```

## Regla de trabajo
```txt
1 tarea = 1 chat
1 chat auditor por tarea
Al cerrar una tarea se documenta
El siguiente chat parte leyendo README.md y docs/next-step.md
```

## Regla de tamaño
```txt
Ningún archivo debe superar 100 líneas
Si crece, se refactoriza
1 doc = 1 responsabilidad
```

## Documentación
```txt
TEMPLATE_ARCHITECTURE.md
docs/README.md
docs/current-state.md
docs/principles.md
docs/workflow.md
docs/data-model.md
docs/next-step.md
```

## Invariante
```txt
No documentar visión como estado real
No mezclar deuda técnica con pendientes de diseño
No agregar casuística si existe una regla general
```
