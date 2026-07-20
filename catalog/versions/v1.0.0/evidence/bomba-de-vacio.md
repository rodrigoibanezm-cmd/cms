# Revisión de familia: BOMBA DE VACIO

## Grupo

BOMBA DE VACIO

## Informes revisados

- OT 21234 — BOMBA DE VACIO ELEC. YELLOW JACKET SUPEREVAC 93516
- OT 23537 — BOMBA DE VACIO YELLOW JACKET SUPERVAC PLUS 2

## Evidencia observada

### Función técnica

Ambos informes corresponden a bombas eléctricas de vacío usadas para generar vacío. La diferencia de modelo no cambia la función técnica.

### Checklist o pauta

Ambos informes usan la misma identidad de herramienta (`BOMBA DE VACIO`), la misma selección de tipo eléctrico y la misma pauta de evaluación para la herramienta.

### Estructura relevante

Ambos documentos comparten la misma estructura base:

- título técnico de bomba de vacío;
- antecedentes de herramienta y cliente;
- tipo de energía;
- estado de herramienta;
- sección de evaluación con CUMPLE / NO CUMPLE / NO APLICA / OBSERVACIONES.

### Diferencias relevantes

- modelo: SUPEREVAC 93516 vs. SUPERVAC PLUS 2;
- serie, rótulo, técnico, fecha y OT;
- las diferencias son datos de instancia, no de familia.

## Decisión

- familia propuesta: `BOMBA_DE_VACIO`
- estado: `CONFIRMED`
- motivo: misma función técnica, misma pauta y misma estructura relevante.

## Cambio derivado

Agregar en `families.json` la familia `BOMBA_DE_VACIO` con alias `BOMBA DE VACIO`.

## Impacto esperado

- `CONFIRMED`: +2
- `UNMAPPED`: -2
- `REVIEW`: sin cambios
- total de informes: sin cambios
