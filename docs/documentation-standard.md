# Estándar de documentación

## Objetivo

```txt
Permitir que otro chat entienda el sistema real sin repetir errores.
Permitir auditar docs contra reglas explícitas.
```

## Principio principal

```txt
La documentación describe estado real, decisiones cerradas y próximo paso.
No reemplaza el código.
No inventa arquitectura futura.
```

## Regla de tamaño

```txt
Máximo 120 líneas por archivo.
Si crece, dividir por responsabilidad.
README opera como router, no como enciclopedia.
```

## Unidad documental

```txt
1 doc = 1 responsabilidad.
1 sección = 1 idea.
1 bloque txt = regla o contrato operativo.
```

## Estructura recomendada

```txt
# Título

## Responsabilidad
## Estado actual
## Flujo o contrato
## Invariante
## Qué no hacer
```

No todos los docs necesitan todas las secciones.

## Tipos de documentos

```txt
README.md = router general
docs/README.md = router documental
current-state.md = foto real del sistema
principles.md = reglas rectoras
next-step.md = puente al próximo chat
deuda-tecnica.md = deuda real
```

## Regla de verdad

```txt
Estado actual = confirmado en código o validación.
Pendiente = decisión no implementada.
Deuda técnica = problema real o riesgo operativo.
Hipótesis = no documentar como hecho.
```

## Estilo

```txt
frases cortas
bloques txt para reglas
sin narrativa larga
sin marketing
sin promesas
sin relleno
```

## Auditoría documental

Un auditor debe revisar:

```txt
cada archivo tiene una responsabilidad clara
ningún archivo supera 120 líneas
README enruta, no explica todo
no hay contradicción entre docs
no hay estado futuro escrito como presente
next-step tiene una sola tarea siguiente
la deuda técnica no es backlog de ideas
```

## Criterio de aprobación

```txt
Un chat nuevo puede leer README + docs/README + current-state + next-step
y entender qué existe, qué falta y qué no debe tocar.
```

## Criterio de rechazo

```txt
Docs largos sin frontera clara.
Duplicación de responsabilidad.
Planes futuros escritos como hechos.
Archivos legacy sin marcar.
Next-step con más de una tarea.
```
