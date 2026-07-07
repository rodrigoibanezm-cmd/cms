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
## Aplicación por vista
```txt
Operación: docs/ui-operation-view.md
Dashboard: mismo sistema, solo lectura
OT: tocar lo mínimo, solo forma
Configuración: backoffice del super_admin
```
## Invariante
```txt
El usuario debe saber cuál es la siguiente OT a resolver.
La UI debe parecer producto, no script interno.
La información es protagonista.
```
