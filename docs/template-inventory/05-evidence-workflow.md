# Evidence workflow

## Objetivo

Determinar si un pendiente corresponde a:

```txt
variante de nombre -> alias
ambigüedad real    -> REVIEW
familia nueva      -> nuevo maestro futuro
caso aislado       -> permanece UNMAPPED
```

## Secuencia

1. Agrupar pendientes por nombre probable.
2. Abrir todos los informes del grupo.
3. Comparar título interno, pauta, checklist y estructura.
4. Buscar históricos con nombres alternativos.
5. Revisar modelos, marcas y función técnica.
6. Registrar la conclusión y su evidencia.
7. Implementar solo la conclusión respaldada.

## Criterio para alias

Hay una misma familia aunque los archivos tengan nombres distintos.

Ejemplo:

```txt
TRIPODE MILWAUKEE
LUMINARIA PEDESTAL
mismo modelo 2130-20
misma pauta interna
→ alias a LUMINARIA
```

## Criterio para familia nueva

Se considera candidata cuando existen varios informes con:

```txt
misma pauta
misma checklist
misma estructura
identidad técnica propia
```

La frecuencia ayuda a priorizar la revisión, pero no reemplaza la evidencia.

## Regla conservadora

Cuando la evidencia no alcanza, el caso permanece `UNMAPPED` o `REVIEW`.
No se completa por contexto ni por similitud aparente.