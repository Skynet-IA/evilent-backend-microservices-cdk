# 🔐 SEGURIDAD - EVILENT BACKEND

## 📋 Contenido
1. [Overview](#overview)
2. [Secrets Management](#secrets-management)
3. [Authentication & Authorization](#authentication--authorization)
4. [Input Validation](#input-validation)
5. [Penetration Testing](#penetration-testing)
6. [Security Scanning](#security-scanning)
7. [Incident Response](#incident-response)

---

## 🎯 Overview

### Aplicación de Reglas de Seguridad
✅ **REGLA #2:** Ningún dato sensible en el código
✅ **REGLA #5:** Validación con Zod en todos los endpoints
✅ **REGLA #6:** Defense in depth con múltiples capas

### Principios de Seguridad
1. **Least Privilege:** Cada usuario/servicio solo tiene acceso necesario
2. **Defense in Depth:** Múltiples capas de seguridad
3. **Zero Trust:** Validar siempre, nunca confiar
4. **Fail Secure:** Rechazar por defecto

---

## 🔐 Secrets Management

### Ubicación de Secrets
✅ **Credenciales:** AWS Secrets Manager
✅ **Tokens de CI/CD:** GitHub Actions Secrets
✅ **Credenciales de BD:** Variables de entorno en AWS Lambda

### Servicios con Secrets
```
📋 USER-SERVICE:
   ├─ COGNITO_POOL_ID (Secrets Manager)
   ├─ COGNITO_APP_CLIENT_ID (Secrets Manager)
   └─ DB_PASSWORD_TEST (GitHub Actions)

📋 PRODUCT-SERVICE:
   ├─ COGNITO_POOL_ID (Secrets Manager)
   ├─ COGNITO_APP_CLIENT_ID (Secrets Manager)
   └─ MONGODB_URI_TEST (GitHub Actions)
```

### Verificación de Secrets
```bash
# Verificar que NO hay secrets en código
npm run scan:secrets

# Revisar logs de seguridad
aws logs tail /aws/lambda/UserServiceStack --follow
aws logs tail /aws/lambda/ProductServiceStack --follow

# GitLeaks automático en cada push (GitHub Actions)
# ✅ Ejecuta: gitleaks scan + .gitleaksignore
# ✅ Diferencia: Tokens ficticios vs secrets reales
# ✅ Documentación: Ver GITLEAKS_STRATEGY.md
```

### Manejo de False Positives
- 📄 Archivo de configuración: `.gitleaksignore`
- 📋 Documentación detallada: `GITLEAKS_STRATEGY.md`
- ✅ Todos los false positives documentados y justificados
- ✅ REGLA #2 cumplida: No hay secrets reales en código

---

## 🔑 Authentication & Authorization

### JWT Implementation (REGLA #6: Defense in Depth)
```
┌─────────────────────────────────────┐
│ API GATEWAY                         │
│  ├─ Validate JWT (Capa 1)          │
│  └─ Allow if valid                 │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ LAMBDA HANDLER                      │
│  ├─ Validate JWT again (Capa 2)    │
│  ├─ Extract user context            │
│  └─ Enforce permissions             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ BUSINESS LOGIC                      │
│  ├─ Validate user ownership (Capa 3)│
│  └─ Log security events             │
└─────────────────────────────────────┘
```

### Token Expiration
- Access Token: 1 hour
- Refresh Token: 7 days
- Revocation: Immediate

---

## ✅ Input Validation (REGLA #5: Zod)

### Validación en User-Service
```typescript
// src/config/validated-constants.ts
const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

// src/utility/error.ts - REGLA #5 compliance
export function validateInput(data: unknown, schema: ZodSchema) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return formatZodErrors(result.error);
  }
  return result.data;
}
```

### Validación en Product-Service
```typescript
// src/config/validated-constants.ts
const ProductSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().max(2000),
  category_id: z.string().ObjectId(),
  price: z.number().positive(),
});
```

### OWASP Top 10 Coverage

| Vulnerabilidad | Protección | Status |
|---|---|---|
| A01: Injection | Zod + Parameterized queries | ✅ |
| A02: Broken Auth | JWT + Defense in depth | ✅ |
| A03: Broken Access Control | Role-based access + User ownership | ✅ |
| A04: XML External Entities | No XML parsing | ✅ |
| A05: Broken Access Control | Input validation + Sanitization | ✅ |
| A06: Vulnerable Components | npm audit + Snyk | ✅ |
| A07: Identification & Auth Failure | JWT + Token rotation | ✅ |
| A08: Data Integrity Failures | HTTPS + Encrypted storage | ✅ |
| A09: Logging & Monitoring | CloudWatch + Structured logs | ✅ |
| A10: SSRF | No external HTTP calls | ✅ |

---

## 🔍 Penetration Testing

### Ejecución Local
```bash
# User-Service Penetration Tests
cd BACKEND/user-service
npm run test:security

# Product-Service Penetration Tests
cd BACKEND/product-service
npm run test:security
```

### Test Coverage

#### SQL Injection (User-Service)
- ✅ Validación de email format
- ✅ Rechazo de payloads maliciosos
- ✅ Prepared statements (via Zod)

#### NoSQL Injection (Product-Service)
- ✅ Validación de ObjectId
- ✅ Rechazo de MongoDB operators
- ✅ Sanitización de inputs

#### XSS Prevention
- ✅ Escaping de HTML
- ✅ Validación de scripts en inputs
- ✅ Content-Security-Policy headers

#### Authentication
- ✅ JWT validation
- ✅ Token expiration
- ✅ Authorization checks

#### Error Handling
- ✅ No stack traces en responses
- ✅ No database error details
- ✅ Mensajes genéricos para errores

#### HTTP Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Strict-Transport-Security

---

## 🔐 Security Scanning

### Workflow: GitHub Actions
```bash
# Ejecuta automáticamente:
# 1. npm audit (vulnerabilidades de dependencias)
# 2. Snyk (scanning de código)
# 3. GitLeaks (detección de secrets)
# 4. TruffleHog (verificación de secrets)
# 5. OWASP Dependency-Check (análisis profundo)
```

### Triggers
- ✅ Push a main/develop
- ✅ Pull requests
- ✅ Scheduled (domingos a las 2 AM UTC)

### Manejo de Vulnerabilidades
```
CRÍTICA (CVSS 9-10)  → Arreglar inmediatamente
ALTA (CVSS 7-8)      → Arreglar en 48 horas
MEDIA (CVSS 5-6)     → Arreglar en 1 semana
BAJA (CVSS 0-4)      → Documentar excepciones
```

---

## 📊 Incident Response

### Proceso de Respuesta
```
1. DETECCIÓN
   └─ CloudWatch Logs → Alertas SNS → Notificación

2. ANÁLISIS
   └─ Revisar logs → Determinar scope → Evaluar impacto

3. REMEDIACIÓN
   └─ Patch → Deploy hotfix → Verificar

4. POST-INCIDENT
   └─ Post-mortem → Actualizar reglas → Comunicar
```

### Channels de Notificación
- 🔔 **Email:** alerts@evilent.com
- 💬 **Slack:** #security-alerts
- 📱 **SMS:** Critical only

### Checklist de Seguridad

Antes de cada deploy:
- [ ] npm audit sin vulnerabilidades críticas
- [ ] Snyk scan exitoso
- [ ] Secrets scan sin alertas
- [ ] Penetration tests pasando
- [ ] IAM policies reviewadas
- [ ] Logs de audit revisados
- [ ] Performance dentro de límites

---

## 📚 Referencias

### Documentación
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Herramientas
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [GitLeaks](https://gitleaks.io/)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)

---

## 🎯 Next Steps

### FASE 7: Documentation (Próximo)
- [ ] Deployment Guide
- [ ] Troubleshooting
- [ ] Runbook

### FASE 8: E2E Pipeline Validation
- [ ] Staging branch testing
- [ ] Full deployment simulation
- [ ] Rollback validation

---

**Última actualización:** 2025-11-10
**Mantenedor:** Skynet-IA
**Status:** ✅ SECURITY IMPLEMENTADO

