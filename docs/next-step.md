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
asignación de secretaria implementada
cola por secretaria implementada
aprobación de secretaria implementada
```

## Decisiones tomadas

```txt
No tocar review_status todavía.
El workflow operativo usa current_state.
El PDF se activa después de secretary_approved_at.
```

## Próxima tarea

```txt
Probar flujo completo de secretaria y definir generación PDF final.
```

Debe validar:

```txt
admin asigna OT a secretaria
secretaria ve solo su cola
secretaria aprueba OT
OT sale de la cola de secretaria
admin ve PDF habilitado
report_events registra secretary_approved
```

## No hacer

```txt
no tocar extractor
no tocar prompts
no cambiar XLS fill
no reemplazar current_state por review_status
no generar PDF sin definir contrato mínimo
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md, docs/current-state.md, docs/principles.md y docs/next-step.md.
Prueba el flujo de secretaria aprobado y prepara el contrato mínimo del PDF final.
No modificar extractor.
Mantener archivos bajo 120 líneas.
```
