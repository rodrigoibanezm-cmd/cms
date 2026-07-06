# Estado actual

## Estado

```txt
v0 admin-secretary operativo parcial
```

El sistema ya no está solo en diseño.

## Flujo real

```txt
técnico sube informe + fotos
→ /api/process-report
→ crea report en Neon
→ sube inputs a Drive
→ Gemini extrae y audita
→ generación XLS determinística
→ publicación XLS
→ admin ve planilla por defecto
→ admin asigna secretaria
→ secretaria revisa su cola
→ secretaria aprueba desde el detalle
→ admin abre PDF final
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
recovery limitado
admin listado en planilla
detalle visual de revisión
asignación de secretaria
cola por secretaria con total/pendientes
cola secretaria incluye pendientes y aprobadas
aprobación de secretaria
PDF final idempotente desde XLS generado
```

## Qué está incompleto

```txt
rechazo formal desde admin/secretaria
edición controlada de campos desde admin/secretaria
flujo de cierre de OT
calibración real del confidence_score
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
El PDF final se crea una vez y luego se reutiliza.
El sistema conserva trazabilidad.
```

## Invariante

```txt
No mover complejidad al front técnico.
No usar IA para escribir celdas del Excel.
No asumir aprobación automática por semáforo.
No producir preview XLS.
```
