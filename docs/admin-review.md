# Admin Review

## Responsabilidad

```txt
Permitir revisión administrativa de OTs procesadas.
Comparar informe original contra XLS generado.
Mostrar alertas, archivos y trazabilidad.
```

## Rutas

```txt
/admin
/admin?view=cards
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

## Listado admin

Archivo:

```txt
web/app/admin/page.js
```

Estado real:

```txt
/admin abre en planilla
/admin?view=cards abre tarjetas
muestra OT, estado, técnico, fecha, prioridad, administrativa y acciones
no muestra semáforo en planilla
permite asignar secretaria si la OT está en cola admin
mantiene visible la OT aprobada
habilita PDF si existe secretary_approved_at
```

## Detalle revisión

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
estado workflow
botón Aprobar OT cuando aplica
```

No muestra:

```txt
semaforo
confidence_score
```

## Cola secretaria

Archivo:

```txt
web/app/admin/secretary/page.js
```

Muestra:

```txt
solo OTs de esa secretaria
pendientes y aprobadas
total y pendientes
OT, estado, técnico, fecha, prioridad, administrativa y acciones
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
No existe generación PDF final real.
```

## Invariante

```txt
El admin no debe depender de archivos sueltos.
Debe leer report, files y events desde Neon.
La revisión debe mostrar evidencia antes que confianza.
```
