# Pipeline

## Endpoint principal

```txt
POST /api/process-report
```

Archivo:

```txt
web/app/api/process-report/route.js
```

## Entrada

```txt
report = 1 imagen del informe
photos = 1 o más fotos de detalle
ot = opcional
```

## Flujo

```txt
1. valida que exista informe y fotos
2. crea fila en reports
3. convierte archivos a buffer
4. sube original y fotos a Drive
5. ejecuta runExtraction
6. guarda extraction_json en Neon
7. genera XLS en memoria
8. audita imagen vs XLS
9. intenta recovery si aplica
10. guarda auditoría
11. publica XLS final
12. responde report_id + link XLS
```

## Orquestación

```txt
route.js solo maneja HTTP
web/lib/process_report/* contiene pasos del flujo
ningún archivo debe superar 120 líneas
```

## Extracción

```txt
Gemini Flash = pass1
matchTemplate = familia por checklist
Gemini Pro = pass2 guiado por checklist oficial
validateExtraction = reglas determinísticas
```

## Semáforo

```txt
VERDE = score >= 90
AMARILLO = score >= 70
ROJO = score < 70
```

## Recovery

```txt
Solo corre si auditor decide recover.
Solo usa campos permitidos.
No rehace todo el informe.
Regenera XLS y vuelve a auditar.
```

## Salida JSON

```txt
ok
report_id
color
ot
semaforo
confidence_score
template_filename
excel_url
drive_file_id
audit
recovery
```

## Preview XLS

```txt
No se produce preview XLS.
El preview anterior era malo para revisión fina.
El admin debe usar el XLS real.
```

## Invariante

```txt
El pipeline debe ser lineal y auditable.
No esconder pasos críticos en el front.
No publicar XLS antes de auditar.
```
