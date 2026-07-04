# Target Flow

## Estado

```txt
flujo objetivo
no implementado completo todavía
```

No reemplaza `current-state.md`.

## Flujo técnico

```txt
técnico saca foto del informe
→ sistema procesa extracción rápida
→ si semáforo ROJO, técnico vuelve a sacar foto
→ si semáforo VERDE/AMARILLO, sigue flujo admin
```

## Flujo supervisor/admin

```txt
OT llega a pantalla admin supervisor
supervisor ve consola general
supervisor asigna OT a una secretaria
supervisor puede revisar estado de producción
```

## Secretarias

```txt
admin configura secretarias
admin puede agregar secretaria
admin puede sacar secretaria
cada secretaria ve solo su cola
cada secretaria ve aprobadas y por aprobar
```

## Flujo secretaria

```txt
secretaria abre su cola
revisa OT asignada
aprueba OT
estado cambia en admin
se genera PDF
```

## PDF

```txt
PDF se genera solo después de aprobación secretaria
botón PDF aparece en línea de producción
admin puede descargar PDF desde ese botón
```

## Consola admin

```txt
dashboard operacional
cola total
OT por estado
OT por secretaria
OT aprobadas
OT por aprobar
PDF disponibles
```

## Estados necesarios

```txt
uploaded
processed
needs_new_photo
pending_assignment
assigned
secretary_review
approved_by_secretary
pdf_generated
rejected
error
```

## Invariantes

```txt
El técnico solo corrige foto si semáforo rojo.
El supervisor asigna trabajo.
La secretaria aprueba.
El PDF nace después de aprobación secretaria.
Cada secretaria ve solo su cola.
```

## No hacer todavía

```txt
no detallar UI final
no rediseñar todas las vistas en este documento
no mezclar con estado actual
no implementar sin cerrar cimientos primero
```
