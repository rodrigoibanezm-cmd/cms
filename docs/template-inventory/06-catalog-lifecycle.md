# Catalog lifecycle

## Flujo

```txt
nuevos informes reales
        ↓
inventario
        ↓
CONFIRMED / REVIEW / UNMAPPED
        ↓
revisión de evidencia
        ↓
alias / regla explícita / familia candidata
        ↓
pruebas
        ↓
nueva ejecución
        ↓
nueva versión del catálogo
```

## Versionado

Cada cambio al catálogo debe ser trazable mediante:

```txt
commit
motivo
familia afectada
evidencia usada
pruebas agregadas
impacto en conteos
```

## Criterios de aceptación

```txt
los casos esperados cambian de estado
los no relacionados no cambian
REVIEW no disminuye por prioridades accidentales
UNMAPPED disminuye solo con evidencia
el total de informes permanece estable
```

## Regresión

Si una ejecución empeora los conteos o confirma casos ambiguos:

1. comparar pendientes anteriores y actuales;
2. identificar archivos que cambiaron de estado;
3. revisar aliases y reglas;
4. no restaurar matchers defectuosos;
5. corregir con una regla explícita y pruebas.

## Relación con producción

Stage 0 convive con el renderer actual.
No migra plantillas reales ni modifica el flujo productivo hasta que la cobertura esté validada.