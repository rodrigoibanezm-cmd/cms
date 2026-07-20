# Family inference

## Regla general

La inferencia es determinística y trabaja sobre nombres normalizados.

```txt
quitar extensión
normalizar mayúsculas y acentos
reducir separadores y espacios
comparar aliases por palabras completas
```

## Prohibiciones

```txt
no fuzzy matching
no IA para clasificar nombres
no prioridades automáticas entre familias
no coincidencias accidentales por subcadena
```

## Resultado

```txt
0 coincidencias  -> UNMAPPED
1 coincidencia   -> CONFIRMED
2+ coincidencias -> REVIEW
```

## Reglas explícitas

Una ambigüedad conocida puede expresarse mediante una regla específica cuando el matcher general no debe capturarla.

Caso canónico:

```txt
LLAVE TORQUE RAD
LLAVE DE TORQUE RAD
→ E_RAD | LLAVE_DE_TORQUE_O_IMPACTO
→ REVIEW
```

La regla no debe activarse para:

```txt
TRANSDUCTOR DE TORQUE RAD
→ UNMAPPED
```

## Invariante

El matcher general debe seguir siendo simple. Una excepción documentada no autoriza a introducir heurísticas amplias.