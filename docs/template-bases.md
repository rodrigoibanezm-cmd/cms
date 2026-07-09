# Template Bases

## Responsabilidad

```txt
Construir XLS base limpios desde candidatos reales.
Mantener catálogo de bases disponible para render XLS.
```

## Workflow

```txt
.github/workflows/build-template-bases.yml
```

Nombre:

```txt
Build template bases
```

## Inputs

```txt
families
candidates_folder
bases_folder
```

## Script principal

```txt
tools/templates/build_missing_bases.py
```

## Flujo

```txt
1. recibe familias separadas por coma
2. busca carpeta de familia en candidatos_plantillas
3. elige candidato XLSX
4. limpia template
5. sube {FAMILIA}_TECNICOS_BASE.xlsx a Bases
```

## Cambio manual desde OT

```txt
Cuando el matching falle en borde, la Vista OT puede cambiar plantilla.
El usuario debe poder elegir una base existente del catálogo.
También debe poder subir una nueva base XLSX al catálogo.
El sistema debe regenerar el XLS desde el JSON ya extraído.
No se debe reejecutar extracción IA por este cambio.
```

## Trazabilidad esperada

```txt
registrar report_events.event = template_changed
guardar template_key/template_filename vigente en reports
invalidar PDF previo si existía
mantener archivos originales intactos
```

## Limpieza

Archivo:

```txt
tools/templates/clean_xlsx.py
```

Hace:

```txt
deja una hoja técnica
elimina hojas de fotos
borra valores a la derecha de etiquetas
borra marcas X y /
borra textos variables
conserva formato base
```

## Requisito de formato

```txt
Las bases deben ser archivos XLSX nativos.
No usar Google Sheets como base aunque el nombre termine en .xlsx.
No convertir una base por Google Sheets para hacerla compatible.
La conversion por Google Sheets puede perder merges, alturas y anchos.
Si una base no abre como XLSX nativo, se reemplaza la base.
```

## Autenticación

Soporta:

```txt
GOOGLE_SERVICE_ACCOUNT_JSON
```

También:

```txt
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
```

## Invariante

```txt
Una base limpia conserva layout.
Una base limpia no conserva datos de una OT real.
No usar bases generadas como fuente de verdad de extracción.
Cambiar plantilla no cambia la extracción original.
```