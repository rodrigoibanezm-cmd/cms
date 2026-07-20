# Template Inventory v2

Documentación vigente del inventario determinístico de familias de informes.

## Objetivo actual

```txt
informes reales de Drive
→ inventario
→ inferencia determinística de familia
→ CONFIRMED / REVIEW / UNMAPPED
→ revisión de evidencia
→ evolución del catálogo
```

Stage 0 descubre qué familias aparecen en los informes reales y cuáles requieren evidencia o incorporación al catálogo.

Todavía no compara sistemáticamente todas las familias contra los maestros `_FINAL` ni reemplaza el renderer productivo.

## Implementación real

```txt
tools/template_inventory/
web/lib/template_inventory/run_inventory.js
web/pages/api/template-inventory.js
```

El endpoint protegido ejecuta el inventario y devuelve:

```txt
total
conteos por estado
pending = REVIEW + UNMAPPED
```

## Reglas de inferencia

```txt
0 coincidencias   → UNMAPPED
1 coincidencia    → CONFIRMED
2+ coincidencias  → REVIEW
```

El matcher general usa aliases como secuencias completas de palabras.

Está prohibido usar:

```txt
fuzzy matching
prioridades automáticas entre familias
coincidencias accidentales por subcadena
clasificación por intuición
```

## Ambigüedad RAD

```txt
LLAVE TORQUE RAD
LLAVE DE TORQUE RAD
→ E_RAD | LLAVE_DE_TORQUE_O_IMPACTO
→ REVIEW
```

No se activa para:

```txt
TRANSDUCTOR DE TORQUE RAD
→ UNMAPPED
```

## Evidencia

Cada cambio debe seguir esta secuencia:

```txt
agrupar pendientes
abrir los informes reales
comparar título, pauta, checklist y estructura
buscar históricos y nombres alternativos
concluir alias, REVIEW o familia nueva
agregar pruebas
volver a ejecutar
comparar conteos
```

Casos ya validados:

```txt
TRIPODE → LUMINARIA
GRASERA → familia GRASERA
```

## Estado validado

Última ejecución antes de incorporar GRASERA:

```txt
TOTAL       557
CONFIRMED   525
UNMAPPED     26
REVIEW        6
```

Resultado esperado tras incorporar GRASERA:

```txt
CONFIRMED   528
UNMAPPED     23
REVIEW        6
```

## Relación con producción

Stage 0 convive con el renderer actual.

No migra plantillas reales, no modifica el flujo productivo y no reemplaza el catálogo vigente hasta que la cobertura esté validada.