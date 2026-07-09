# Deuda técnica

Este documento registra deuda real.

No es backlog de ideas.
No es roadmap comercial.
No es visión futura.

## 1. Rechazo y cierre operativo pendientes

Estado:

```txt
DEUDA FUNCIONAL
```

Problema:

```txt
Existe aprobación desde UI/API.
No existe rechazo formal desde UI.
No existe cierre operativo final posterior al PDF.
```

Nota:

```txt
No mezclar con edición controlada.
Se revisará dentro del nuevo target flow.
```

## 2. Confidence no calibrado

Estado:

```txt
DEUDA DE CALIDAD
```

Problema:

```txt
confidence_score usa pesos heurísticos.
No está calibrado contra muestra real.
```

Impacto:

```txt
El semáforo orienta, pero no certifica calidad.
```

Acción sugerida:

```txt
usar muestra real auditada
comparar extracción vs resultado esperado
recalibrar pesos
```

## 3. Edición admin pendiente

Estado:

```txt
PENDIENTE DE DISEÑO
```

Problema:

```txt
admin/secretaria aún no corrigen campos estructurados.
No existe approved_json ni diff de correcciones.
```

No hacer todavía:

```txt
editor complejo de Excel
workflow de usuarios avanzado
```

## Resuelto

```txt
preview XLS dejó de producirse
process-report fue modularizado bajo 120 líneas
aprobación secretaria/admin quedó operativa
PDF final idempotente quedó operativo
```