/**
 * 📦 MIDDLEWARE BARREL EXPORT
 *
 * TAREA 2.2: Centralizar exports de middleware
 *
 * ✅ REGLA PLATINO: Código escalable
 * ✅ REGLA #4 BACKEND: Centralizar en un punto único
 *
 * USO:
 * ────
 * ```typescript
 * // ❌ ANTES (incorrecto):
 * import { requireAuth } from '../../api/middleware/auth.middleware';
 * import { attachRequestId } from '../../api/middleware/request-id.middleware';
 *
 * // ✅ DESPUÉS (correcto):
 * import { requireAuth, attachRequestId } from '../../api/middleware';
 * ```
 */

export { requireAuth, optionalAuth } from './auth.middleware';
export { requestIdMiddleware, getRequestId } from './request-id.middleware';

