# Review policy

## Propósito

`REVIEW` protege al catálogo contra decisiones automáticas cuando existe más de una interpretación válida.

## Cuándo usar REVIEW

```txt
dos o más aliases coinciden por reglas válidas
una ambigüedad técnica fue documentada explícitamente
el nombre no permite elegir una sola familia sin revisar evidencia
```

## Cuándo no usar REVIEW

```txt
cuando no coincide ninguna familia: UNMAPPED
cuando una única familia está respaldada: CONFIRMED
para esconder un matcher defectuoso
como prioridad manual temporal
```

## Caso canónico RAD

```txt
LLAVE TORQUE RAD
LLAVE DE TORQUE RAD
→ E_RAD | LLAVE_DE_TORQUE_O_IMPACTO
→ REVIEW
```

`RAD` por sí solo no es alias de `E_RAD`.
Por eso:

```txt
TRANSDUCTOR DE TORQUE RAD
→ UNMAPPED
```

## Resolución

Un caso REVIEW se resuelve revisando:

```txt
título interno del informe
pauta y checklist
modelo y función de la herramienta
maestros históricos relacionados
```

La resolución puede producir:

```txt
alias respaldado
regla explícita más precisa
nueva familia
permanencia en REVIEW
```

Nunca se resuelve agregando una prioridad automática entre familias.