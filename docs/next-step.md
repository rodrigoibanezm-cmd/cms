# Next Step

## Contexto

La repo ya tiene corpus documental base.

El README opera como router.
Los docs están separados por responsabilidad.
Se fijó la regla de 120 líneas por archivo.

## Estado validado documental

```txt
README actualizado
docs/README.md creado
current-state documentado
principios documentados
pipeline documentado
Neon documentado
Drive documentado
XLS documentado
auditoría/recovery documentado
admin review documentado
template bases documentado
operations documentado
deuda técnica documentada
```

## Problema actual

```txt
El admin revisa pero no cierra formalmente la OT.
```

Hoy existen campos para aprobación/rechazo en Neon, pero falta flujo operativo completo.

## Objetivo del próximo chat

```txt
Implementar cierre admin mínimo.
```

Debe permitir:

```txt
aprobar OT
rechazar OT
registrar evento
actualizar review_status
mostrar estado final en admin
```

## No hacer

```txt
no editor complejo de XLS
no gestión de usuarios avanzada
no BI
no rediseño grande del admin
no cambiar pipeline de extracción
```

## Pitch para nuevo chat

```txt
@GitHub lee README.md y docs/README.md.
Luego lee docs/current-state.md, docs/admin-review.md y docs/next-step.md.
Objetivo: implementar cierre admin mínimo para aprobar/rechazar una OT.
No tocar pipeline de extracción ni generación XLS.
No crear archivos sobre 120 líneas.
1 responsabilidad por archivo.
```
