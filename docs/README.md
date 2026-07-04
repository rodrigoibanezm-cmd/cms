# Documentación CMS

Router documental de la repo.

## Lectura mínima para un chat nuevo

```txt
README.md
docs/current-state.md
docs/next-step.md
```

## Mapa documental

```txt
current-state.md    estado real del sistema
principles.md       reglas rectoras
pipeline.md         flujo process-report
data-model.md       Neon y eventos
drive.md            archivos en Google Drive
xls-generation.md   generación Excel
audit-recovery.md   auditoría IA y recovery
admin-review.md     front/admin de revisión
template-bases.md   workflow de bases XLS
operations.md       operación y env vars
deuda-tecnica.md    deuda real
next-step.md        pitch para siguiente chat
```

## Regla de tamaño

```txt
máximo 120 líneas por archivo
si crece, separar por responsabilidad
no crear documentos enciclopédicos
```

## Regla de verdad

```txt
Estado actual = lo que el código hace hoy.
Pendiente = decisión o feature no cerrada.
Deuda técnica = problema real que ya duele o puede romper.
```

## Regla de cierre de tarea

```txt
1. cerrar implementación
2. auditar en chat separado
3. documentar lo que quedó real
4. actualizar next-step.md
5. abrir siguiente chat con README + next-step
```

## No usar docs para

```txt
ideas sueltas
roadmap comercial
explicaciones largas
promesas futuras
```
