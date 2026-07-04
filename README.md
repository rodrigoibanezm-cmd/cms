# CMS

Digitalización auditada de informes técnicos Covaclean.

Esta repo contiene la app móvil, el pipeline IA, la generación XLS determinística, la persistencia Neon, la integración Drive y el admin de revisión.

## Responsabilidad de esta repo

```txt
front técnico de carga
api process-report
pipeline de extracción IA
generación XLS determinística
subida de archivos a Drive
persistencia Neon
admin de revisión
auditoría IA
recovery quirúrgico
workflow de templates base
```

## Fuera de esta repo

```txt
ERP
BI histórico avanzado
gestión completa de usuarios
firma documental final
workflow operativo externo a la revisión admin
```

## Principio central

```txt
El técnico carga evidencia.
La IA extrae y audita.
El backend decide forma, persistencia y XLS.
Neon es fuente de verdad.
Drive guarda archivos.
El admin revisa antes de cerrar.
```

## Estado actual

```txt
runtime Next.js
frontend técnico simple
pipeline IA conectado
XLS generado desde templates Drive
inputs y outputs guardados en Drive
reports/files/events guardados en Neon
admin visual operativo
aprobación/rechazo formal todavía incompleta
```

## Regla de trabajo

```txt
1 tarea = 1 chat.
1 chat auditor por tarea.
Al cerrar una tarea se documenta.
El siguiente chat parte leyendo este README y docs/next-step.md.
```

## Regla de tamaño

```txt
Ningún archivo debe superar 120 líneas.
Si un archivo crece, se refactoriza.
La misma regla aplica para docs.
1 doc = 1 responsabilidad.
```

## Documentación

```txt
docs/README.md
```

Ruta recomendada:

```txt
1. README.md
2. docs/README.md
3. docs/current-state.md
4. docs/next-step.md
```

## Documentos principales

```txt
docs/current-state.md
docs/principles.md
docs/pipeline.md
docs/data-model.md
docs/drive.md
docs/xls-generation.md
docs/audit-recovery.md
docs/admin-review.md
docs/template-bases.md
docs/operations.md
docs/deuda-tecnica.md
docs/next-step.md
```

## Invariante

```txt
No documentar visión como si fuera estado real.
No mezclar deuda técnica con pendientes de diseño.
No agregar casuística si existe una regla general.
```