# Documentación CMS

Router documental de la repo.

## Lectura mínima para un chat nuevo

```txt
README.md
docs/current-state.md
docs/principles.md
docs/next-step.md
```

## Lectura de destino

```txt
docs/destination/README.md
```

Esta lectura muestra hacia dónde va el producto.
No describe estado actual implementado.

## Mapa documental

```txt
documentation-standard.md estándar para crear/auditar docs
current-state.md           estado real del sistema
workflow.md                flujo operacional y ownership de OT
principles.md              reglas rectoras y manual de trabajo
pipeline.md                flujo process-report
data-model.md              Neon y eventos
drive.md                   archivos en Google Drive
xls-generation.md          generación Excel
audit-recovery.md          auditoría IA y recovery
admin-review.md            front/admin de revisión
template-bases.md          workflow de bases XLS
operations.md              operación y env vars
deuda-tecnica.md           deuda real
next-step.md               pitch para siguiente chat
destination/README.md      destino del producto, no estado actual
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
Destination = hacia dónde va el producto.
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

## Auditoría documental

```txt
Auditar contra docs/documentation-standard.md.
No auditar contra gusto personal.
```

## No usar docs para

```txt
ideas sueltas
roadmap comercial
explicaciones largas
promesas futuras
```