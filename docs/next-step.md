# Next Step

## Contexto

El proyecto ya cuenta con workflow admin/secretaria, PDF final idempotente, Confianza IA V1 y Vista Operación V1 inicial.

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
PDF final descarga archivo
PDF conserva primera hoja y FOTOS
PDF no usa Google Sheets API
Confianza IA definida como KPI V1
Vista Operación V1 implementada en /admin
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
La secretaria asignada no se borra al aprobar.
El PDF requiere secretary_approved_at.
Confianza IA guía revisión, no aprueba ni rechaza.
Precisión real IA queda para V2 con approved_json.
```

## Próxima tarea

```txt
Auditar Vista Operación V1 en producción contra docs/ui-operation-view.md.
```

Debe validar:

```txt
menú compacto sin sidebar permanente
header con tenant, usuario y rol
resumen superior compacto
búsqueda única global
tabla OT + técnico, Confianza IA, workflow, secretaria, espera y PDF
PDF vacío cuando no exista
sin botón Revisar como acción principal
asignación de secretaria sigue operativa
```

## No hacer

```txt
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
no crear semáforo operacional V1
no implementar approved_json ni diff todavía
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Audita Vista Operación V1 en producción contra docs/ui-operation-view.md.
No modificar extractor.
Mantener archivos bajo 100 líneas.
```