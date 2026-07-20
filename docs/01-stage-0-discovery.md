# Stage 0 — Discovery

Estado: congelado.

## Objetivo

Construir el catálogo inicial de familias a partir de evidencia real sin modificar el flujo productivo.

## Método

1. Inventariar informes reales.
2. Inferir familias con reglas determinísticas.
3. Separar CONFIRMED, REVIEW y UNMAPPED.
4. Revisar evidencia por grupo.
5. Registrar una ficha de decisión.
6. Actualizar aliases y pruebas.
7. Reejecutar el inventario y medir impacto.

## Criterio de familia

Una familia requiere:

- misma función técnica;
- misma pauta o checklist;
- misma estructura relevante del informe.

Marca, modelo, capacidad, número de parte y rótulo no definen una familia.

## Resultado final

```text
557 informes
544 CONFIRMED
13 UNMAPPED
0 REVIEW
```

Snapshot: `v1.0.0`.

Los 13 UNMAPPED forman un backlog pasivo. No se resuelven anticipadamente.

## Trazabilidad

Cada cambio aplicado durante Stage 0 tiene una ficha en:

```text
docs/template-inventory/reviews/
```

El catálogo final, las reglas y las pruebas quedan fijados por el commit de cierre de Stage 0.

## Cierre

Stage 0 no debe volver a ejecutarse como campaña masiva salvo necesidad excepcional y documentada.

Desde este punto, la incorporación de familias se rige por `02-operational-catalog.md`.
