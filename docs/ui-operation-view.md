# UI Operation View

## Responsabilidad
```txt
Definir la forma visual de la Vista Operación.
No describe lógica ni permisos backend.
```
## Concepto
```txt
Operación
Bandeja de trabajo del supervisor
```
Debe sentirse como bandeja de trabajo.
No como dashboard.

## Contenido
```txt
resumen compacto
búsqueda única
filtros desplegables
tabla de OTs
fila clickeable
flecha final de entrada
```
## Tabla
La tabla es el centro de la pantalla.

Columnas recomendadas:
```txt
OT
Técnico
Semáforo IA
Estado workflow
Secretaria asignada
Tiempo esperando
PDF
```
## Reglas
```txt
No usar botón Revisar como acción principal.
Toda la fila abre la OT.
No convertir la vista en dashboard.
No mostrar prioridad como columna fija.
Usar prioridad para ordenar la cola.
```
## Búsqueda
Una sola búsqueda global.
Debe buscar:
```txt
OT
técnico
cliente
PDF
plantilla
```
## Navegación
```txt
Sin sidebar permanente.
Menú compacto desplegable.
La vista debe reservar ancho para la tabla.
```
## Invariante
```txt
El supervisor debe saber por cuál OT partir.
La siguiente acción debe ser obvia.
```
