# UI Design System

## Responsabilidad

```txt
Definir el look & feel transversal del producto.
No reemplaza las vistas ni describe lógica backend.
```

## Objetivo visual

```txt
sobrio
técnico
ejecutivo
operacional
```

La interfaz debe ayudar a decidir rápido.
No debe competir con la información.

## Vistas principales

```txt
Vista Dashboard
Vista Operación
Vista OT
Vista Configuración
```

Los roles habilitan vistas.
Las vistas no deben duplicarse por rol.

## Navegación

```txt
No usar sidebar permanente como regla base.
Usar menú desplegable compacto.
Renderizar opciones según permisos.
```

Ejemplo por rol:

```txt
super_admin: Dashboard, Operación, Configuración
admin: Dashboard, Operación
dashboard: Dashboard
secretary: Mi Cola
```

## Vista Operación

Debe sentirse como bandeja de trabajo.
No como dashboard.

Título recomendado:

```txt
Operación
Bandeja de trabajo del supervisor
```

La tabla es el centro de la pantalla.

## Operación: contenido

```txt
Resumen compacto
Búsqueda única
Filtros desplegables
Tabla de OTs
Fila clickeable
Flecha final de entrada
```

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

## Operación: reglas

```txt
No usar botón Revisar como acción principal.
No convertir la vista en dashboard.
No mostrar prioridad como columna fija.
Usar prioridad para ordenar la cola.
```

## Vista Dashboard

Debe usar el mismo lenguaje visual.
Solo lectura.
Muestra métricas, calidad, tiempos y cuellos de botella.

## Vista OT

Tocar lo mínimo.
Mantener flujo y estructura.
Aplicar solo lenguaje visual común:

```txt
colores
tipografía
espaciados
fondos
bordes
botones
```

## Vista Configuración

Backoffice del super_admin.
Debe reutilizar el mismo sistema visual.

## Sistema visual

```txt
fondo gris muy claro
superficies blancas
azul institucional para acción primaria
verde/amarillo/rojo solo para estados
bordes 12-16px
sombras suaves
espaciado en múltiplos de 8px
Inter como tipografía base
```

## Invariante

```txt
El usuario debe saber cuál es la siguiente OT a resolver.
La UI debe parecer producto, no script interno.
La información es protagonista.
```
