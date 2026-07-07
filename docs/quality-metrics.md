# Quality Metrics

## Responsabilidad

```txt
Definir métricas de calidad visibles en el producto.
Separar métricas V1 de métricas futuras.
No describe implementación técnica.
```

## V1: Confianza IA

```txt
Nombre: Confianza IA
Base: confidence_score generado por extracción/auditoría IA
Pregunta que responde: qué tan segura estaba la IA de la extracción
```

La confianza IA es un insumo para revisión.
No es aprobación automática.
No es semáforo operacional final.

## Uso en UI

```txt
Indicadores: promedio, bajo 80%, bajo 60%
Operación: señal compacta para priorizar atención
Detalle OT: porcentaje, motivos de duda y campos sugeridos
```

## Rangos visuales V1

```txt
85-100 = Alta
60-84  = Media
0-59   = Baja
```

Los rangos son operativos.
Deben calibrarse con evidencia cuando exista historial real.

## V2: Precisión real IA

```txt
Base futura: ia_json vs approved_json
Cálculo: diff determinístico campo por campo
Resultado: correction_count y campos corregidos
```

La precisión real permite responder:

```txt
cuánto corrigió la secretaria
qué plantillas fallan más
qué campos fallan sistemáticamente
si confidence_score predice correcciones reales
```

## Invariantes

```txt
No inventar precisión real sin approved_json.
No usar IA para calcular diffs de aprobación.
No mezclar Confianza IA con estado workflow.
No llamar semáforo operacional a confidence_score.
```
