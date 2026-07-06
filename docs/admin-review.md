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
/admin/report?id=report_id
/admin/secretary?id=secretary_id
```

## API admin

```txt
GET /api/admin/reports
GET /api/admin/reports/id
GET /api/report-file?id=file_id
POST /api/admin/reports/assign
POST /api/secretary/reports/id/approve
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
current_state
fecha
prioridad
secretaria asignada
link a revisión
botón PDF cuando secretaria aprueba
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

## Cola secretaria

Archivo:

```txt
web/app/admin/secretary/page.js
```

Muestra:

```txt
solo OTs asignadas a esa secretaria
botón Aprobar OT
```

Al aprobar:

```txt
current_state = secretary_approved
secretary_approved_at = now()
approved_by_secretary_id = secretaria
report_events.event = secretary_approved
```

## Visualización de imágenes

```txt
/api/report-file descarga desde Drive por file_id.
El front usa lupa sobre la imagen original.
```

## Estado incompleto

```txt
No existe rechazo formal desde UI.
No existe edición controlada de campos desde admin/secretaria.
No existe generación PDF final.
```

## Invariante

```txt
El admin no debe depender de archivos sueltos.
Debe leer report, files y events desde Neon.
La revisión debe mostrar evidencia antes que confianza.
```
