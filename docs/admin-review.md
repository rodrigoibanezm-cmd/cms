# Admin Review

## Responsabilidad

```txt
Permitir que administración revise la OT procesada.
Comparar informe original contra XLS generado.
Ver alertas del auditor y trazabilidad.
```

## Rutas

```txt
/admin
/admin/report?id={report_id}
```

## API admin

```txt
GET /api/admin/reports
GET /api/admin/reports/{id}
GET /api/report-file?id={file_id}
```

## Pantalla listado

Archivo:

```txt
web/app/admin/page.js
```

Muestra:

```txt
OT
semaforo
status
review_status
confidence_score
link a revisión
link a XLS
```

## Pantalla revisión

Archivo:

```txt
web/app/admin/report/page.js
```

Muestra:

```txt
informe original
XLS generado
fotos detalle
issues del auditor
historial de eventos
```

## Visualización de imágenes

```txt
/api/report-file descarga desde Drive por file_id.
El front usa lupa sobre la imagen original.
```

## Estado incompleto

```txt
No existe cierre formal desde UI.
No existe approve/reject operativo desde admin.
No existe edición controlada de campos desde admin.
```

## Invariante

```txt
El admin no debe depender de archivos sueltos.
Debe leer report, files y events desde Neon.
La revisión debe mostrar evidencia antes que confianza.
```
