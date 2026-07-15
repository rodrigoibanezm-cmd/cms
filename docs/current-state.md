# Estado actual

## Estado

```txt
v0 admin-secretary operativo parcial
```

El sistema ya no está solo en diseño.

## Flujo real

```txt
técnico sube informe + fotos
/api/process-report crea report en Neon
sube inputs a Drive
Gemini extrae y audita
generación XLS determinística
publicación XLS
admin ve Vista Operación
admin asigna secretaria
secretaria revisa su cola
secretaria aprueba desde el detalle
admin descarga PDF final
```

## Qué funciona

```txt
front técnico de carga
endpoint process-report modularizado
persistencia reports/files/events
upload de original y fotos
extracción pass1/pass2
match contra catálogo
generación XLS desde template Drive
auditoría IA
confidence_score disponible como Confianza IA V1
recovery limitado
hints de auditoría se conservan aunque recovery corrija
Vista Operación V1 en /admin
detalle visual de revisión
asignación de secretaria
cola por secretaria con total/pendientes
cola secretaria incluye pendientes y aprobadas
aprobación de transcripción por administrativa
PDF final idempotente desde XLS generado
PDF descarga archivo, no abre vista Drive
PDF usa ExcelJS + Drive export, no Google Sheets API
```

## Vista Operación V1

```txt
menú compacto sin sidebar permanente
header con tenant, usuario y rol
resumen superior compacto
búsqueda global por OT, técnico, cliente, PDF y plantilla
tabla OT + técnico, Confianza IA, workflow, secretaria, espera y PDF
PDF vacío cuando no corresponde generar
asignación de secretaria sigue disponible desde la fila
```

## Qué está incompleto

```txt
rechazo formal desde admin/secretaria
edición controlada de campos desde admin/secretaria
flujo de cierre de OT
calibración real del confidence_score
precisión real IA por diff contra approved_json
```

## Fuente de verdad

```txt
Neon = estado del proceso y JSON
Drive = archivos originales y generados
XLS/PDF = entregables, no fuente de verdad
```

## Modelo operativo actual

```txt
El técnico no corrige.
El técnico solo sube evidencia.
El admin asigna.
La secretaria revisa y aprueba.
La aprobación no borra la secretaria asignada.
El PDF final se crea una vez por versión vigente y luego se reutiliza.
La aprobación actual registra transcription_approved_at; la aprobación final separada aún no existe.
El sistema conserva trazabilidad.
```

## Invariante

```txt
No mover complejidad al front técnico.
No usar IA para escribir celdas del Excel.
No asumir aprobación automática por Confianza IA.
No producir preview XLS.
```
