# Next Step

## Contexto

La repo ya tiene corpus documental base.

También existe un flujo objetivo nuevo:

```txt
docs/target-flow.md
```

## Estado validado

```txt
README opera como router
docs/README.md opera como router documental
documentation-standard.md fija estándar
target-flow.md describe flujo futuro
current-state.md describe estado real
process-report fue modularizado
preview XLS dejó de producirse
```

## Decisión tomada

```txt
No tocar review_status todavía.
Eso se revisará dentro del nuevo flujo operativo.
```

## Problema actual

```txt
El target flow requiere modelo mínimo antes de codear.
```

## Objetivo del próximo chat

```txt
Diseñar modelo mínimo del target flow.
```

Debe definir:

```txt
estados de OT
roles operativos
asignaciones
colas de trabajo
momento de generación PDF
rutas mínimas necesarias
```

## No hacer

```txt
no implementar todavía
no generar PDF todavía
no rediseñar dashboard todavía
no cambiar extractor ni XLS fill
no tocar review_status sin modelo aprobado
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/README.md y docs/documentation-standard.md.
Luego lee docs/current-state.md, docs/target-flow.md y docs/next-step.md.
Objetivo: diseñar modelo mínimo del target flow antes de codear.
No implementar todavía.
No tocar extractor, prompts ni generación XLS.
Mantener archivos bajo 120 líneas y 1 responsabilidad por archivo.
```
