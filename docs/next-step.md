# Next Step

## Contexto

El proyecto ya cuenta con documentación base y con la infraestructura mínima de workflow implementada.

## Estado validado

```txt
README opera como router
current-state refleja el estado real
workflow mínimo persistido en reports
cada OT conoce su estado y dueño actual
process-report mueve la OT a admin_queue
preview XLS eliminado
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
```

## Próxima tarea

```txt
Implementar asignación de secretaria.
```

Debe incluir:

```txt
catálogo de secretarias
assigned_to_secretary
cola por secretaria
reasignación
```

## No hacer

```txt
no generar PDF todavía
no rediseñar dashboard todavía
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Implementa únicamente la asignación de secretaria usando current_state.
No crear PDF.
No modificar extractor.
Mantener archivos bajo 120 líneas.
```}