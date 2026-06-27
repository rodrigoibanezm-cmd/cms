# Flujo final

Este es el flujo operativo definitivo del MVP.

```text
Foto informe + fotos equipo
↓
Pasada barata detecta familia
↓
Busca template base limpio en Drive
↓
Template define campos/checklist a extraer
↓
Pasada cara extrae JSON guiado
↓
Backend llena XLS final
↓
Guarda resultado en Drive/output
```

## Principio central

La IA no genera Excel.

La IA solo hace dos cosas:

1. Detectar la familia del informe.
2. Extraer un JSON guiado por la plantilla base.

El XLS final lo genera siempre el backend con codigo deterministico.

## Entradas

- Foto del informe tecnico.
- Una o mas fotos del equipo.
- Carpeta Drive con templates base limpios.
- Carpeta Drive/output para resultados.

## Paso 1: pasada barata

Objetivo: detectar la familia del equipo con el menor costo posible.

Salida esperada:

```json
{
  "family": "TALADRO",
  "confidence": 0.92
}
```

Regla: si la familia no alcanza confianza suficiente, el caso queda pendiente de revision.

## Paso 2: template base

Con la familia detectada, el backend busca en Drive el archivo:

```text
{FAMILIA}_TECNICOS_BASE.xlsx
```

Ejemplo:

```text
TALADRO_TECNICOS_BASE.xlsx
```

Ese XLS base es la fuente de verdad para:

- campos esperados;
- checklist disponible;
- layout final;
- formato del entregable.

## Paso 3: extraccion cara guiada

La segunda pasada IA no intenta entender todo libremente.

Debe extraer solo lo que el template necesita.

Salida esperada:

```json
{
  "family": "TALADRO",
  "fields": {},
  "checklist": {},
  "observations": [],
  "equipment_photos": []
}
```

El JSON debe guardar evidencia suficiente para auditar cada dato cuando aplique.

## Paso 4: llenado XLS

El backend abre el template base limpio y completa:

- datos del informe;
- checklist;
- observaciones;
- fotos del equipo;
- metadatos de procesamiento.

No se permite que la IA escriba directamente el XLS.

## Paso 5: salida Drive

El XLS final se guarda en:

```text
Drive/output
```

Nombre sugerido:

```text
{OT}_{FAMILIA}_{ROTULO}.xlsx
```

## Estado actual repo

Ya existe la parte de templates base:

- `api/templates/build-base.js`: construye un template base limpio desde un candidato XLSX.
- `docs/template-bases-cloud.md`: documenta el workflow de bases tecnicas en Drive.

Pendiente de implementar:

- endpoint de procesamiento final del informe;
- detector barato de familia;
- extractor caro guiado por template;
- llenador deterministico del XLS final;
- subida del XLS generado a `Drive/output`.
