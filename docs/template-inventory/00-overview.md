# Overview

## Problema

El sistema histórico partía desde plantillas conocidas y trataba de asignar cada informe a una de ellas.
Eso ocultaba familias faltantes, mezclaba variantes de nombre con familias reales y favorecía decisiones manuales sin trazabilidad.

## Decisión v2

Agregar una etapa obligatoria antes del catálogo productivo:

```txt
Drive reports
    ↓
inventory
    ↓
family inference
    ↓
CONFIRMED / REVIEW / UNMAPPED
    ↓
evidence review
    ↓
catalog evolution
```

## Principios

```txt
la evidencia real precede al diseño del catálogo
el matcher general es determinístico
los aliases se aprueban con evidencia
las ambigüedades se expresan como REVIEW
UNMAPPED no es error: es trabajo de descubrimiento
el renderer productivo no cambia durante Stage 0
```

## Resultado esperado

Stage 0 responde una sola pregunta:

> ¿Qué familias presentes en los informes reales no están cubiertas por los maestros existentes?

No intenta extraer datos, interpretar checklists ni migrar maestros.