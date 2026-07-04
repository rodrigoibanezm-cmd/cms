# Next Step

## Contexto

La repo ya tiene corpus documental base.

También existe un flujo objetivo nuevo:

```txt
docs/target-flow.md
```

## Estado validado documental

```txt
README opera como router
docs/README.md opera como router documental
documentation-standard.md fija estándar
target-flow.md describe flujo futuro
current-state.md describe estado real
```

## Problema actual

Antes de implementar el target flow hay que afirmar cimientos.

Cimientos débiles actuales:

```txt
process-report supera 120 líneas
review_status mezcla auditoría IA con aprobación admin
preview XLS se genera pero no define bien su rol en admin
```

## Objetivo del próximo chat

```txt
Fix de cimientos antes del nuevo flujo.
```

Debe hacer:

```txt
separar process-report en archivos menores
corregir semántica de review_status
mantener auditoría IA como recomendación, no cierre admin
definir si preview XLS se usa o queda fuera del flujo admin
actualizar docs afectados
```

## No hacer

```txt
no implementar secretarias todavía
no implementar dashboard admin todavía
no generar PDF todavía
no rediseñar vistas todavía
no cambiar extractor ni XLS fill
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/README.md y docs/documentation-standard.md.
Luego lee docs/current-state.md, docs/target-flow.md y docs/next-step.md.
Objetivo: fix de cimientos antes de implementar el target flow.
No implementar secretarias, dashboard ni PDF todavía.
Primero separar process-report bajo 120 líneas y corregir review_status.
No tocar extractor, prompts ni generación XLS salvo que sea necesario para el refactor.
```
