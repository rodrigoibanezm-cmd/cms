# Next Step

## Contexto

El proyecto ya cuenta con workflow admin/secretaria operativo parcial y documentación actualizada.

## Estado validado

```txt
README opera como router
docs/README opera como mapa documental
current-state refleja estado real
workflow mínimo persistido en reports
process-report mueve la OT a admin_queue
preview XLS eliminado
asignación de secretaria implementada
cola por secretaria implementada
cola muestra pendientes y aprobadas
aprobación de secretaria implementada
admin abre por defecto en planilla
planilla muestra técnico y no semáforo
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
La secretaria asignada no se borra al aprobar.
El PDF se activa después de secretary_approved_at.
```

## Próxima tarea

```txt
Definir e implementar el contrato mínimo del PDF final.
```

Debe validar:

```txt
qué archivo se convierte en PDF
cuándo se genera
qué ruta lo entrega
qué se guarda en Neon
qué evento se registra
qué ve admin después de generado
```

## No hacer

```txt
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
no generar PDF sin contrato mínimo
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Define primero el contrato mínimo del PDF final y luego implementa solo eso.
No modificar extractor.
Mantener archivos bajo 120 líneas.
```
