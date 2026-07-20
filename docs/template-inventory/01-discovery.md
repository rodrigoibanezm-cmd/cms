# Stage 0: Discovery

## Entrada

```txt
carpeta Drive con informes reales
carpeta Drive con maestros _FINAL
catálogo de familias y aliases
```

## Estados

```txt
CONFIRMED  exactamente una familia válida
REVIEW     más de una familia válida o ambigüedad explícita
UNMAPPED   ninguna familia válida
```

## Método de trabajo

1. Ejecutar el inventario completo.
2. Comparar los conteos con la ejecución anterior.
3. Revisar solo REVIEW y UNMAPPED.
4. Buscar evidencia en informes y maestros históricos.
5. Implementar alias, ambigüedad explícita o nueva familia.
6. Agregar pruebas.
7. Volver a ejecutar.

## Salidas del inventario

```txt
informes_reales.csv
maestros_final.csv
matriz_cobertura.csv
validaciones.csv
resumen.md
```

La función protegida devuelve el total, los conteos y la lista de pendientes.

## Criterio de seguridad

Una mejora válida reduce UNMAPPED sin convertir ambigüedades reales en CONFIRMED por accidente.