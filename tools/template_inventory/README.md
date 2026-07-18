# Inventario de familias — Etapa 0

Objetivo único: listar todos los informes reales y proponer una familia para cada archivo.

## Ejecutar

```bash
node tools/template_inventory/cli.js \
  --reports-folder 1QSWVylHQNkqU0J_pJ4s6T5831CtGhnbM \
  --output outputs/template_inventory
```

Requiere credenciales Google mediante `GOOGLE_APPLICATION_CREDENTIALS` o `GOOGLE_SERVICE_ACCOUNT_JSON`.

## Salida

```text
outputs/template_inventory/informes_reales.csv
```

Columnas:

```text
archivo,familia_inferida,estado
```

Estados:

- `CONFIRMED`: coincide con una única familia declarada en `families.json`.
- `REVIEW`: coincide con más de una familia.
- `UNMAPPED`: no existe todavía una regla declarada.

Esta etapa no consulta maestros `_FINAL`, no calcula cobertura y no modifica el flujo productivo.
