# Alias policy

## Definición

Un alias es una variante de nombre para una familia ya existente.
No crea una familia nueva ni modifica el maestro.

## Evidencia suficiente

Un alias puede aprobarse cuando los informes muestran de forma consistente:

```txt
mismo título interno
misma pauta o checklist
misma estructura
mismo tipo de herramienta
modelo o contexto técnico compatible
```

## Ejemplos aprobados

```txt
AMOLADORA              -> ESMERIL
RECTIFICADOR            -> BURIL
TRIPODE                 -> LUMINARIA
LUMINARIA DE PEDESTAL   -> LUMINARIA
CARRETE ELEC            -> CARRETE_ELECTRICO
GATA NEUMOHID           -> GATA_HIDRAULICA
```

`TRIPODE -> LUMINARIA` fue aprobado porque los seis informes usan internamente `LUMINARIA PEDESTAL` y coinciden con históricos del modelo Milwaukee 2130-20.

## No es evidencia suficiente

```txt
parecido lingüístico
una palabra compartida
marca compartida sin misma pauta
un solo nombre ambiguo
intuición del implementador
```

## Casos que deben esperar

```txt
TORQUE CLICK
TORQUE RELOJ
```

Permanecen UNMAPPED hasta revisar evidencia técnica.

## Regla de cambio

Todo alias nuevo debe incluir:

```txt
evidencia revisada
cambio acotado en families.json
prueba automática
nueva ejecución del inventario
comparación de conteos
```