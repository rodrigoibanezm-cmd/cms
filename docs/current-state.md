# Estado actual

## Estado

```txt
v0 admin-review en desarrollo
```

El sistema ya no está solo en diseño.

## Flujo real

```txt
técnico sube informe + fotos
→ /api/process-report
→ crea report en Neon
→ sube inputs a Drive
→ Gemini Flash extrae datos base
→ match de template por checklist
→ Gemini Pro extrae inspección guiada
→ validación determinística
→ generación XLS determinística
→ auditoría Gemini
→ recovery quirúrgico si aplica
→ publicación XLS + preview
→ admin revisa
```

## Qué funciona

```txt
front técnico de carga
endpoint process-report
persistencia reports/files/events
upload de original y fotos
extracción pass1/pass2
match contra catálogo
generación XLS desde template Drive
auditoría IA
recovery limitado
admin listado
admin revisión visual
```

## Qué está incompleto

```txt
aprobación formal desde admin
rechazo formal desde admin
edición controlada de campos desde admin
flujo de cierre de OT
calibración real del confidence_score
preview XLS visualmente suficiente para revisión fina
```

## Fuente de verdad

```txt
Neon = estado del proceso y JSON
Drive = archivos originales y generados
XLS = entregable, no fuente de verdad
```

## Modelo operativo actual

```txt
El técnico no corrige.
El técnico solo sube evidencia.
El admin revisa.
El sistema conserva trazabilidad.
```

## Invariante

```txt
No mover complejidad al front técnico.
No usar IA para escribir celdas del Excel.
No asumir aprobación automática por semáforo.
```
