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
/admin/report?id=report_id
/admin/secretary
```

## API admin

```txt
GET /api/admin/reports
GET /api/admin/reports/id
GET /api/admin/reports/id/pdf
GET /api/report-file?id=file_id
POST /api/admin/reports/assign
POST /api/secretary/reports/id/approve
```

## Listado admin

```txt
/admin abre en planilla
muestra OT, ingreso, técnico, Confianza IA, workflow, administrativa, espera y PDF
no usa semáforo operacional en planilla
mantiene visible la OT aprobada
PDF se habilita si existe secretary_approved_at
```

## Operación V1

```txt
La bandeja es Vista Operación.
La tabla prioriza OT + cliente, técnico, Confianza IA, workflow, secretaria, espera y PDF.
La OT y la acción Abrir llevan al detalle.
No debe depender de preview XLS.
```

## Detalle revisión

```txt
archivo: web/app/admin/report/page.js
muestra informe original, XLS, fotos, auditoría, eventos y estado workflow
Confianza IA debe ayudar a focalizar revisión
botón Aprobar aprueba la transcripción y aparece cuando aplica
detalle muestra Transcripción pendiente o Transcripción aprobada
para ESMERIL muestra el XLS final como documento independiente
OTs aprobadas sin informe final pueden generarlo desde el detalle
Regenerar XLS permite cambiar plantilla manualmente
```

## Confianza IA

```txt
Debe mostrarse como insumo de revisión.
No decide aprobación.
No reemplaza evidencia visual.
No es precisión real IA.
```

Debe incluir cuando exista:

```txt
confidence_score
motivos de duda
campos sugeridos para revisar
audit.issues
```

## Cola secretaria

```txt
ruta: /admin/secretary
archivo: web/app/admin/secretary/page.js
muestra solo OTs de esa secretaria por token
incluye pendientes y aprobadas
muestra total y pendientes
```

## PDF final

```txt
ruta: GET /api/admin/reports/id/pdf
requiere secretary_approved_at
responde como descarga, no como vista Drive
si generated_pdf vigente existe, descarga ese archivo
si no existe, crea copia XLS imprimible con ExcelJS
la copia imprimible conserva primera hoja y FOTOS
no usa Google Sheets API
convierte esa copia vía Drive export
sube el PDF a Drive
registra report_files.kind = generated_pdf
registra report_events.event = final_document_generated
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
No existe cierre operativo final.
No existe approved_json ni diff de correcciones.
No existe aún aprobación separada del informe final.
```

## Invariante

```txt
El admin no debe depender de archivos sueltos.
Debe leer report, files y events desde Neon.
La revisión debe mostrar evidencia antes que confianza.
El PDF final se crea una sola vez por versión vigente y luego se reutiliza.
No depender de Google Sheets API para el PDF.
```
