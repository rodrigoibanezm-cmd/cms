# Template Bases

## Responsabilidad

```txt
Construir XLS base limpios desde candidatos reales.
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
```
