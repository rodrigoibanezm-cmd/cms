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

Impacto:

```txt
La revisión queda visual.
La OT no queda formalmente cerrada.
```

Acción sugerida:

```txt
crear endpoints approve/reject
registrar evento
actualizar review_status
mostrar estado final en admin
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

## 3. Preview XLS limitado

Estado:

```txt
DEUDA DE REVIEW
```

Problema:

```txt
preview SVG es liviano pero no reemplaza revisión fina del XLS.
```

Acción sugerida:

```txt
mantener link a XLS real
mejorar vista admin sin cambiar pipeline
```

## 4. Edición admin pendiente

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
