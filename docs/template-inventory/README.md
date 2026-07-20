# Template Inventory v2

Metodología vigente para descubrir, validar y versionar familias de informes antes de migrar plantillas.

## Cambio central

```txt
Antes: reporte -> plantilla
Ahora: reportes reales -> inventario -> familias -> catálogo -> renderer
```

El catálogo no se diseña por intuición. Se descubre desde evidencia real.

## Ruta de lectura

```txt
1. 00-overview.md
2. 01-discovery.md
3. 02-family-inference.md
4. 03-alias-policy.md
5. 04-review-policy.md
6. 05-evidence-workflow.md
7. 06-catalog-lifecycle.md
8. ADR-001-template-discovery.md
```

## Alcance

```txt
incluye inventario Drive
incluye inferencia determinística
incluye aliases respaldados
incluye REVIEW explícito
incluye trazabilidad y versionado
no migra plantillas reales
no reemplaza el renderer productivo
no borra la documentación anterior
```

## Implementación

```txt
tools/template_inventory/
api/template-inventory.js
```

## Regla operativa

Solo se trabaja sobre `REVIEW` y `UNMAPPED`.
Cada cambio debe estar respaldado por evidencia y pruebas.