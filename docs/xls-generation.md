# XLS Generation

## Responsabilidad

```txt
Generar el Excel final desde una plantilla oficial.
```

Archivo principal:

```txt
web/lib/xls_generator.js
```

## Entrada

```txt
extraction
photos
```

## Template

El backend busca en Drive:

```txt
extraction.template_filename
```

Dentro de:

```txt
GOOGLE_DRIVE_TEMPLATES_FOLDER_ID
BASES_FOLDER_ID
```

## Motor

```txt
ExcelJS
```

## Llenado actual

```txt
header
specific_fields
disposition/status
inspection
text sections
parts
JSON completo
fotos
```

## Regla de celdas

```txt
La regla general es búsqueda dinámica por etiquetas.
Los mapas hardcodeados son excepción.
```

Archivo reservado para excepciones:

```txt
web/lib/xls_cell_maps.js
```

Estado actual:

```txt
CELL_MAPS = {}
```

## Hojas extra

El XLS generado agrega:

```txt
EXTRACCION_JSON
FOTOS
```

## Publicación

Si `publish=true`:

```txt
sube XLS a Drive
registra generated_xls
actualiza reports.excel_url
```

## Preview

Se genera un SVG liviano:

```txt
generated_xls_preview
```

## Invariante

```txt
La IA nunca escribe celdas.
No agregar casuística por plantilla si una regla dinámica sirve.
No romper formato de la plantilla oficial.
```
