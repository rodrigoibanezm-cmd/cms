# Next Step

## Contexto

El proyecto ya cuenta con workflow admin/secretaria y PDF final idempotente.

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
PDF final se crea una vez y luego se reutiliza
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
La secretaria asignada no se borra al aprobar.
El PDF requiere secretary_approved_at.
```

## Próxima tarea

```txt
Probar en producción el flujo PDF y corregir solo errores reales.
```

Debe validar:

```txt
click en PDF después de aprobar
se crea report_files.generated_pdf
se registra final_document_generated
segundo click reutiliza el PDF existente
Drive abre el PDF correcto
```

## No hacer

```txt
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
no agregar features antes de probar PDF
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Prueba el flujo PDF en producción y corrige solo errores reales.
No modificar extractor.
Mantener archivos bajo 100 líneas.
```
