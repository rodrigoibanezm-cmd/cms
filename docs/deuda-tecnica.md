# Deuda técnica

Este documento registra deuda real.

No es backlog de ideas.
No es roadmap comercial.
No es visión futura.

## 1. Admin no cierra OT

Estado:

```txt
DEUDA FUNCIONAL
```

Problema:

```txt
Existen campos approved/rejected en Neon.
Pero no existe flujo UI/API completo para cerrar aprobación o rechazo.
```

Nota:

```txt
No corregir ahora.
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
admin aún no corrige campos estructurados.
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
```
