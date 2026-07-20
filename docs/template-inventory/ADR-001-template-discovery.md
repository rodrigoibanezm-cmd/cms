# ADR-001: Template discovery before catalog migration

## Estado

Aceptado.

## Contexto

La cobertura de plantillas se estaba evaluando desde los maestros conocidos.
Ese enfoque no demostraba que el universo real de informes estuviera cubierto y podía crear familias por intuición, duplicar pautas o esconder variantes nominales.

## Decisión

Adoptar una etapa de descubrimiento determinístico obligatoria antes de migrar plantillas reales.

```txt
reportes reales
→ inventario
→ inferencia de familia
→ revisión de pendientes
→ catálogo validado
→ migración futura
```

## Razones

```txt
la evidencia precede a la estructura
los nombres de archivo no son autoridad suficiente
las ambigüedades deben permanecer visibles
el catálogo debe evolucionar con trazabilidad
la clasificación repetible no debe depender de IA
```

## Consecuencias positivas

```txt
cobertura medible
menos familias duplicadas
aliases respaldados
regresiones detectables por conteos y pruebas
separación entre descubrimiento y producción
```

## Costos

```txt
requiere revisar evidencia manualmente
algunos casos permanecen pendientes
el inventario debe repetirse tras cada cambio
```

## Alternativas rechazadas

```txt
clasificación fuzzy
prioridad automática entre aliases
crear una plantilla por cada nombre distinto
usar IA para decidir familias sin evidencia
```

## Invariante

No migrar plantillas reales hasta cerrar la cobertura suficiente del inventario.