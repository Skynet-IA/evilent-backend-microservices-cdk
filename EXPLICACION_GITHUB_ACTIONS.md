# 🤖 EXPLICACIÓN COMPLETA: GitHub Actions CI/CD

## ❓ ¿POR QUÉ VES NÚMEROS COMO #1, #2, #6?

### 📊 Los números son **CONTADORES DE EJECUCIONES**, no workflows diferentes

Cada vez que **haces PUSH a GitHub**, el workflow se ejecuta **una sola vez**.

```
Ejemplo de nuestro histórico:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commit 1 (31b353e) → Workflow run #1
Commit 2 (0348f4d) → Workflow run #2
Commit 3 (fd90384) → Workflow run #3
Commit 4 (fc3d7bc) → Workflow run #4
Commit 5 (fbc6131) → Workflow run #5
Commit 6 (e749804) → Workflow run #6
Commit 7 (7f114d1) → Workflow run #7
Commit 8 (adfb731) → Workflow run #8
Commit 9 (d01c42f) → Workflow run #9

```

**NO hay "dos workflows ejecutándose"**, hay **UN workflow ejecutándose 9 veces** (una por cada commit).

---

## 🔍 ESTRUCTURA DE WORKFLOWS (ACTUAL - CORRECTA)

### 📁 Archivos en `/.github/workflows/`

```
/.github/workflows/
├── user-service-ci-cd.yml       ← Se dispara cuando cambias user-service
├── product-service-ci-cd.yml    ← Se dispara cuando cambias product-service
├── reusable-service-ci-cd.yml   ← Workflow REUTILIZABLE (llamado por los dos arriba)
├── ci.yml                        ← ⚠️ LEGACY (ver abajo)
├── cd.yml                        ← ⚠️ LEGACY (ver abajo)
└── manual-deploy.yml             ← ⚠️ LEGACY (ver abajo)
```

### ✅ Workflows ACTIVOS (en uso):

#### 1️⃣ `user-service-ci-cd.yml`
**Cuándo se ejecuta:**
- ✅ Cuando haces PUSH a cualquier archivo en `BACKEND/user-service/**`
- ✅ Cuando cambias `.github/workflows/user-service-ci-cd.yml`
- ✅ Cuando cambias `.github/workflows/reusable-service-ci-cd.yml`

**Qué hace:**
1. Llama al workflow reutilizable: `reusable-service-ci-cd.yml`
2. Pasa parámetros: `service_name: user-service`, `working_directory: BACKEND/user-service`
3. El reusable ejecuta: Build → Tests → Deploy

#### 2️⃣ `product-service-ci-cd.yml`
**Cuándo se ejecuta:**
- ✅ Cuando haces PUSH a cualquier archivo en `BACKEND/product-service/**`
- ✅ Cuando cambias `.github/workflows/product-service-ci-cd.yml`
- ✅ Cuando cambias `.github/workflows/reusable-service-ci-cd.yml`

**Qué hace:**
Exactamente lo mismo que user-service, pero para product-service

#### 3️⃣ `reusable-service-ci-cd.yml`
**Cuándo se ejecuta:**
- ❌ NUNCA directamente (es un workflow `workflow_call`)
- ✅ Solo cuando es llamado por `user-service-ci-cd.yml` o `product-service-ci-cd.yml`

**Qué hace (JOBS):**
```
JOB 1: build-test
  ├─ Checkout código
  ├─ Setup Node.js
  ├─ npm ci (instalar dependencias)
  ├─ npm run type-check (validar tipos TypeScript)
  ├─ npm run build (compilar + preparar lambda-deploy)
  ├─ npm run test:unit (tests unitarios)
  ├─ npm run test:integration (tests de integración)
  └─ Reportar coverage a Codecov

JOB 2: deploy (solo si JOB 1 pasa Y estamos en branch main)
  ├─ Checkout código
  ├─ Setup Node.js
  ├─ AWS credentials
  ├─ npm ci
  ├─ npm run build
  ├─ npm run cdk:synth (generar CloudFormation template)
  ├─ npm run cdk:deploy (desplegar a AWS)
  └─ npm run test:integration (verificar que funciona)
```

---

## 🚨 WORKFLOWS LEGACY (VIEJOS - NO USAR)

### ❌ `ci.yml`, `cd.yml`, `manual-deploy.yml`

Estos son viejos y pueden causar confusión. **Deberían eliminarse**, pero de momento:

**`ci.yml`**: No se ejecuta porque no hay trigger
**`cd.yml`**: No se ejecuta porque no hay trigger
**`manual-deploy.yml`**: Solo se ejecuta si haces `workflow_dispatch` manualmente

---

## 🔴 BUG QUE ENCONTRÉ Y FIXÉ

### ⚠️ PROBLEMA: Paths desactualizados

Los workflows tenían esto:
```yaml
paths:
  - 'BACKEND/.github/workflows/reusable-service-ci-cd.yml'  ❌ NO EXISTE
  - 'BACKEND/.github/workflows/user-service-ci-cd.yml'      ❌ NO EXISTE
```

**Causa**: Después de mover workflows a raíz (/.github/), los paths old apuntaban a nada.

**Consecuencia**: Si cambias el archivo del workflow, NO se re-ejecuta (el trigger no funciona).

**SOLUCION (FIXEADA):**
```yaml
paths:
  - '.github/workflows/reusable-service-ci-cd.yml'  ✅ CORRECTO
  - '.github/workflows/user-service-ci-cd.yml'      ✅ CORRECTO
```

---

## ✅ CÓMO VERIFICAR QUE ESTÁ IMPLEMENTADO CORRECTAMENTE

### 1️⃣ Verifica en GitHub Actions

URL: https://github.com/Skynet-IA/evilent-backend-microservices-cdk/actions

**Debería ver:**
- ✅ Dos workflows activos: "User Service CI/CD" y "Product Service CI/CD"
- ✅ Cada uno con su propio historial de runs
- ✅ Los últimos runs (después de commit d01c42f) deberían estar VERDES

### 2️⃣ Verifica que los triggers funcionan

**Prueba 1**: Modifica cualquier archivo en `BACKEND/user-service/`
- Resultado: Debe aparecer nuevo run en "User Service CI/CD"
- No debe afectar "Product Service CI/CD"

**Prueba 2**: Modifica cualquier archivo en `BACKEND/product-service/`
- Resultado: Debe aparecer nuevo run en "Product Service CI/CD"
- No debe afectar "User Service CI/CD"

**Prueba 3**: Modifica `.github/workflows/user-service-ci-cd.yml`
- Resultado: Debe ejecutarse "User Service CI/CD"

### 3️⃣ Verifica la estructura en terminal

```bash
cd /Users/clay404/Documents/EVILENT

# Debería ver SOLO /.github, NO BACKEND/.github
find . -maxdepth 2 -name ".github" -type d

# Output esperado:
# ./.github
```

---

## 📊 DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────┐
│ TÚ haces: git push origin main                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ GitHub detecta el push         │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴────────────────────┐
        │                                 │
        ▼                                 ▼
   ┌──────────────────┐        ┌──────────────────┐
   │ ¿Cambió algo en  │        │ ¿Cambió algo en  │
   │ BACKEND/user-    │        │ BACKEND/product- │
   │ service/**?      │        │ service/**?      │
   └────────┬─────────┘        └──────────┬───────┘
            │                             │
       SÍ  │ NO                       SÍ  │ NO
            │                             │
            ▼                             ▼
   ┌──────────────────┐        ┌──────────────────┐
   │ Ejecuta:         │        │ Ejecuta:         │
   │ user-service-    │        │ product-service- │
   │ ci-cd.yml        │        │ ci-cd.yml        │
   │ (Run #X)         │        │ (Run #Y)         │
   └────────┬─────────┘        └──────────┬───────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                           ▼
        ┌─────────────────────────────────┐
        │ Llama a reusable workflow:      │
        │ reusable-service-ci-cd.yml      │
        │                                 │
        │ JOB 1: build-test (siempre)     │
        │ JOB 2: deploy (si main + passed)│
        └────────────────┬────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        ┌───────────┐       ┌──────────────┐
        │ ✅ GREEN  │       │ ❌ RED       │
        │           │       │              │
        │ Deployado │       │ Error en:    │
        │ exitoso   │       │ - Build      │
        └───────────┘       │ - Tests      │
                            │ - Deploy     │
                            └──────────────┘
```

---

## 🎯 RESUMEN FINAL

| Concepto | Respuesta |
|----------|-----------|
| **¿Cuántos workflows hay?** | 2 activos (user + product), 3 legacy (no usados) |
| **¿Por qué veo #1, #2, #6?** | Son CONTADORES de ejecuciones, no workflows diferentes |
| **¿Cómo se disparan?** | Automáticamente cuando cambias archivos (trigger paths) |
| **¿Se ejecutan dos a la vez?** | NO. Cada uno se ejecuta cuando SUS archivos cambian |
| **¿Está bien implementado?** | ✅ SÍ (después de fix d01c42f) |
| **¿Cómo verifico?** | Ve a GitHub Actions y veras dos workflows con runs |

---

## 🔧 PRÓXIMOS PASOS

Los workflows están correctamente implementados. Ahora:

1. ✅ Ve a GitHub Actions
2. ✅ Veras "User Service CI/CD" y "Product Service CI/CD"
3. ✅ Espera que los últimos runs terminen (2-3 minutos)
4. ✅ Ambos deberían estar VERDES ✅

**Si ves ROJO**, cuéntame qué error aparece y lo fixamos.

