# Auditoría y recovery

## Responsabilidad

```txt
Comparar imagen original contra XLS generado.
Definir si el caso queda approve, recover o review.
```

## Archivo principal

```txt
web/lib/audit/gemini_auditor.js
```

## Modelo

```txt
GEMINI_AUDIT_MODEL
fallback gemini-2.5-pro
```

## Entrada

```txt
reportImage
xlsBuffer
extraction
```

## Decisiones

```txt
approve = entregable
recover = relectura acotada
review = revisión humana
```

## Recovery

Archivo:

```txt
web/lib/recovery/recovery_runner.js
```

Corre solo si:

```txt
decision = recover
internal_recovery = recover_auto
hay targets permitidos
```

## Campos permitidos para recovery

```txt
ot
cliente
rotulo
fecha_evaluacion
tecnico
marca
modelo
serie
capacidad
tipo
tipo_torque
accionamiento
estado_herramienta
estado_operativo
estado_final
inspeccion
```

## Merge

```txt
mergeRecoveryPatch aplica patch sobre extraction.
Luego se regenera XLS.
Luego se vuelve a auditar.
```

## Invariante

```txt
No rehacer todo el informe.
No corregir layout por recovery.
No aceptar campos fuera de lista.
Si el error es amplio o dudoso, queda review.
```
