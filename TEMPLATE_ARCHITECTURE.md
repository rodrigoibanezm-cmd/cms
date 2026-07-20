# Arquitectura determinística de informes

## Decisión central

El sistema deja de partir desde una lista asumida de plantillas.
Primero descubre las familias reales presentes en los informes históricos y recién después construye el catálogo productivo.

```txt
informes reales
→ inventario
→ inferencia determinística de familias
→ CONFIRMED / REVIEW / UNMAPPED
→ validación con evidencia
→ catálogo versionado
→ extracción estructurada
→ render determinístico
```

## Fuentes de verdad

```txt
Informe original
→ evidencia de lo que el técnico escribió y fotografió

Maestro XLS aprobado
→ definición visual y estructural de una familia

Catálogo versionado
→ relación entre familia, aliases, maestro y versión

JSON validado
→ representación estructurada del contenido extraído

XLS generado
→ resultado reproducible del renderer

Neon
→ estado operativo, trazabilidad y referencias de archivos

Drive
→ almacenamiento de originales, maestros y archivos generados
```

Ningún nombre de archivo aislado es fuente suficiente para definir una familia.

## Definición de plantilla

Una plantilla no es solo un archivo XLS.
Es una unidad versionada compuesta por:

```txt
family_key
aliases respaldados por evidencia
master_xls aprobado
schema de entrada
mapping JSON → celdas
reglas de render
validaciones
versión
trazabilidad
```

Dos informes pertenecen a la misma familia cuando comparten identidad técnica, pauta, checklist y estructura relevante. La frecuencia ayuda a priorizar, pero no reemplaza la evidencia.

## Descubrimiento de familias

El matcher general opera sobre nombres normalizados y aliases por palabras completas.

```txt
0 coincidencias  → UNMAPPED
1 coincidencia   → CONFIRMED
2+ coincidencias → REVIEW
```

Reglas:

```txt
sin fuzzy matching
sin prioridades automáticas entre familias
sin clasificación por subcadenas accidentales
sin crear aliases por intuición
```

Las ambigüedades conocidas se expresan mediante reglas explícitas y pruebas.

## Extracción

La IA puede leer texto manuscrito, interpretar lenguaje y devolver datos estructurados.
No decide la estructura final del documento ni escribe directamente el XLS.

```txt
evidencia original
→ extracción semántica
→ JSON cerrado
→ validación de schema
→ auditoría y recovery controlado
```

Toda corrección automática debe limitarse a campos permitidos y quedar trazada.

## Render determinístico

El renderer recibe únicamente:

```txt
family_key validada
versión de catálogo
maestro aprobado
JSON validado
mapping versionado
```

Y produce siempre el mismo resultado para la misma entrada.

```txt
sin decisiones visuales del LLM
sin búsqueda del último archivo por intuición
sin inferir celdas durante la ejecución
sin modificar el maestro original
```

La selección de maestro y mapping debe ser explícita, versionada y auditable.

## Migración segura

Stage 0 convive con producción. No reemplaza todavía el renderer actual.

```txt
1. descubrir familias
2. resolver REVIEW y UNMAPPED con evidencia
3. validar catálogo
4. incorporar maestros y mappings por familia
5. comparar resultados
6. migrar de forma controlada
```

No se avanza una familia al catálogo productivo sin maestro validado, schema, mapping, pruebas y trazabilidad.
