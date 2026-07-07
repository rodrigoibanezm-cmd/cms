# UI Design System

## Responsabilidad

```txt
Definir el look & feel transversal del producto.
No reemplaza vistas ni describe lógica backend.
```

## Objetivo visual

```txt
sobrio
técnico
ejecutivo
operacional
```

La interfaz debe ayudar a decidir rápido.
La información es protagonista.

## Vistas principales

```txt
Vista Dashboard
Vista Operación
Vista OT
Vista Configuración
```

Las vistas no se duplican por rol.
Los roles solo habilitan acceso y acciones.

## Navegación

```txt
No usar sidebar permanente como regla base.
Usar menú compacto desplegable.
Renderizar opciones según permisos.
```

Acceso esperado:

```txt
super_admin: Dashboard, Operación, Configuración
admin: Dashboard, Operación
dashboard: Dashboard
secretary: Mi Cola
```

## Vista Operación

Debe sentirse como bandeja de trabajo.
No como dashboard.

```txt
Operación
Bandeja de trabajo del supervisor
```

La tabla es el centro de la pantalla.

Contenido:

```txt
resumen compacto
búsqueda única
filtros desplegables
tabla de OTs
fila clickeable
flecha final de entrada
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

Reglas:

```txt
No usar botón Revisar como acción principal.
No convertir la vista en dashboard.
No mostrar prioridad como columna fija.
Usar prioridad para ordenar la cola.
```

## Vista Dashboard

```txt
mismo lenguaje visual
solo lectura
métricas
calidad
tiempos
cuellos de botella
```

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

```txt
backoffice del super_admin
mismo sistema visual
sin diseño especial
```

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
