# 🔄 **FLUJOS - PRODUCT SERVICE**

**Última actualización:** 2025-11-04  
**Versión:** 1.0.0  
**Estado:** Production-Ready

---

## 📋 **Tabla de Contenidos**

1. [Flujo de Autenticación JWT](#flujo-de-autenticación-jwt)
2. [Flujo de Validación con Zod](#flujo-de-validación-con-zod)
3. [Flujo de Conexión a MongoDB](#flujo-de-conexión-a-mongodb)
4. [Flujo Completo: Crear Producto](#flujo-completo-crear-producto)
5. [Flujo Completo: Upload de Imagen](#flujo-completo-upload-de-imagen)
6. [Flujo de Manejo de Errores](#flujo-de-manejo-de-errores)
7. [Flujo de Logging](#flujo-de-logging)

---

## 🔐 **Flujo de Autenticación JWT**

### **Defense in Depth: Doble Validación**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Mobile/Web)                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ 1. Request con JWT
                                 │    Authorization: Bearer <token>
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  🔐 CAPA 1: Cognito Authorizer                             │    │
│  │                                                             │    │
│  │  2. Extrae token del header Authorization                  │    │
│  │     token = header.split('Bearer ')[1]                     │    │
│  │                                                             │    │
│  │  3. Valida con Cognito User Pool                           │    │
│  │     ├─ Verifica firma del JWT                              │    │
│  │     ├─ Verifica que no esté expirado                       │    │
│  │     ├─ Verifica issuer (Cognito URL)                       │    │
│  │     └─ Extrae claims (sub, email, cognito:groups)          │    │
│  │                                                             │    │
│  │  4. Si válido:                                             │    │
│  │     ├─ Agrega claims al contexto de la request            │    │
│  │     └─ Invoca Lambda con contexto                          │    │
│  │                                                             │    │
│  │  5. Si inválido:                                           │    │
│  │     └─ Retorna 401 Unauthorized                            │    │
│  │        { message: "Unauthorized" }                         │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ 6. Invoca Lambda con contexto
                                 │    event.requestContext.authorizer.claims
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCT SERVICE LAMBDA                          │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  🔐 CAPA 2: CognitoVerifierService (Defense in Depth)      │    │
│  │                                                             │    │
│  │  7. Extrae token del header (de nuevo)                     │    │
│  │     const token = event.headers.Authorization              │    │
│  │                   .replace('Bearer ', '')                   │    │
│  │                                                             │    │
│  │  8. Re-valida JWT con CognitoJwtVerifier                   │    │
│  │     const verifier = CognitoJwtVerifier.create({           │    │
│  │       userPoolId: config.cognito.poolId,                   │    │
│  │       tokenUse: 'access',                                  │    │
│  │       clientId: config.cognito.appClientId,                │    │
│  │     });                                                     │    │
│  │                                                             │    │
│  │  9. Verifica token                                         │    │
│  │     const payload = await verifier.verify(token);          │    │
│  │                                                             │    │
│  │  10. Extrae userId para logging                            │    │
│  │      const userId = payload.sub;                           │    │
│  │      const email = payload.email;                          │    │
│  │                                                             │    │
│  │  11. Si válido:                                            │    │
│  │      ├─ Continúa con business logic                        │    │
│  │      └─ Logs incluyen userId real                          │    │
│  │                                                             │    │
│  │  12. Si inválido:                                          │    │
│  │      └─ Retorna 401 Unauthorized                           │    │
│  │         { success: false, message: "Token inválido" }      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### **¿Por qué doble validación?**

| **Escenario** | **Sin Capa 2** | **Con Capa 2** |
|---------------|----------------|----------------|
| API Gateway bypasseado | ❌ Vulnerable | ✅ Protegido |
| Token expirado después de Capa 1 | ❌ Vulnerable | ✅ Detectado |
| Claims manipulados | ❌ Vulnerable | ✅ Detectado |
| Auditoría completa | ⚠️ Parcial | ✅ Completa |

---

## ✅ **Flujo de Validación con Zod**

### **Validación Type-Safe en 3 Pasos**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REQUEST ENTRANTE                                  │
│  POST /product                                                       │
│  Body: {                                                             │
│    "name": "Laptop",                                                 │
│    "price": 999.99,                                                  │
│    "categoryId": "123e4567-e89b-12d3-a456-426614174000"              │
│  }                                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 1: Parseo de JSON                                  │
│  src/utility/request-parser.ts                                       │
│                                                                       │
│  export function parseAndValidateBody<T>(                            │
│    event: APIGatewayEvent,                                           │
│    schema: ZodSchema<T>                                              │
│  ) {                                                                 │
│    // 1.1 Verificar que body existe                                 │
│    if (!event.body) {                                                │
│      return {                                                        │
│        data: null,                                                   │
│        error: ValidationErrorResponse('El body no puede estar vacío')│
│      };                                                              │
│    }                                                                 │
│                                                                       │
│    // 1.2 Parsear JSON                                              │
│    try {                                                             │
│      const body = typeof event.body === 'string'                     │
│        ? JSON.parse(event.body)                                      │
│        : event.body;                                                 │
│    } catch (error) {                                                 │
│      return {                                                        │
│        data: null,                                                   │
│        error: ValidationErrorResponse('El body debe ser un JSON válido')│
│      };                                                              │
│    }                                                                 │
│  }                                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 2: Validación con Zod                              │
│  src/dto/validation-schemas.ts                                       │
│                                                                       │
│  export const CreateProductSchema = z.object({                       │
│    name: z.string()                                                  │
│      .min(3, 'El nombre debe tener al menos 3 caracteres')           │
│      .max(200, 'El nombre no puede exceder 200 caracteres')          │
│      .trim(),                                                        │
│                                                                       │
│    price: z.number()                                                 │
│      .min(0.01, 'El precio mínimo es 0.01')                          │
│      .max(999999.99, 'El precio máximo es 999999.99')                │
│      .refine(val => val > 0, 'El precio debe ser un número positivo'),│
│                                                                       │
│    categoryId: z.string()                                            │
│      .uuid('El ID de categoría debe ser un UUID válido')             │
│      .optional(),                                                    │
│                                                                       │
│    // ... más campos                                                 │
│  });                                                                 │
│                                                                       │
│  // 2.1 Ejecutar validación                                         │
│  const result = schema.safeParse(body);                              │
│                                                                       │
│  // 2.2 Si falla:                                                    │
│  if (!result.success) {                                              │
│    logger.warn('Validación fallida', {                               │
│      errors: result.error.errors                                     │
│    });                                                               │
│                                                                       │
│    return {                                                          │
│      data: null,                                                     │
│      error: ValidationErrorResponse(                                 │
│        'Error de validación de datos',                               │
│        result.error.errors.map(err => ({                             │
│          field: err.path.join('.'),                                  │
│          message: err.message,                                       │
│          code: err.code,                                             │
│        }))                                                           │
│      )                                                               │
│    };                                                                │
│  }                                                                   │
│                                                                       │
│  // 2.3 Si pasa:                                                     │
│  return { data: result.data, error: null };                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 3: Business Logic                                  │
│  src/service/product-service.ts                                      │
│                                                                       │
│  async CreateProduct(event: APIGatewayEvent) {                       │
│    // 3.1 Validar y parsear                                         │
│    const { data, error } = parseAndValidateBody(                     │
│      event,                                                          │
│      CreateProductSchema                                             │
│    );                                                                │
│                                                                       │
│    // 3.2 Si hay error, retornar inmediatamente                     │
│    if (error) return error; // 400 Bad Request                       │
│                                                                       │
│    // 3.3 data es type-safe (TypeScript sabe los tipos)             │
│    logger.info('Creando producto', {                                 │
│      name: data.name,      // ✅ TypeScript sabe que es string       │
│      price: data.price,    // ✅ TypeScript sabe que es number       │
│    });                                                               │
│                                                                       │
│    // 3.4 Continuar con business logic                              │
│    const product = await this.repository.CreateProduct(data);        │
│    return CreatedResponse('Producto creado', product);               │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### **Ejemplo de Error de Validación**

**Request:**
```json
POST /product
{
  "name": "AB",  // ❌ Muy corto (min: 3)
  "price": -10   // ❌ Negativo (min: 0.01)
}
```

**Response:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "data": {
    "errors": [
      {
        "field": "name",
        "message": "El nombre debe tener al menos 3 caracteres",
        "code": "too_small"
      },
      {
        "field": "price",
        "message": "El precio mínimo es 0.01",
        "code": "too_small"
      }
    ]
  }
}
```

---

## 🗄️ **Flujo de Conexión a MongoDB**

### **Con AWS Secrets Manager + Cache**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LAMBDA INVOCATION                                 │
│  Primera invocación o cache expirado                                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 1: Verificar Cache                                 │
│  src/db/db-connection.ts                                             │
│                                                                       │
│  let credentialsCache: MongoDBCredentials | null = null;             │
│                                                                       │
│  async function getMongoDBCredentials() {                            │
│    // 1.1 Verificar si hay cache                                    │
│    if (credentialsCache) {                                           │
│      logger.info('Usando credenciales cacheadas');                   │
│      return credentialsCache; // ✅ Cache hit                        │
│    }                                                                 │
│                                                                       │
│    // 1.2 Cache miss, obtener de Secrets Manager                    │
│    logger.info('Obteniendo credenciales de Secrets Manager');        │
│  }                                                                   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 2: Obtener Secret de AWS                           │
│                                                                       │
│  const secretArn = process.env.MONGODB_SECRET_ARN;                   │
│  if (!secretArn) {                                                   │
│    throw new Error('MONGODB_SECRET_ARN no configurado');             │
│  }                                                                   │
│                                                                       │
│  // 2.1 Crear cliente de Secrets Manager                            │
│  const secretsClient = new SecretsManagerClient({});                 │
│                                                                       │
│  // 2.2 Crear comando para obtener secret                           │
│  const command = new GetSecretValueCommand({                         │
│    SecretId: secretArn                                               │
│  });                                                                 │
│                                                                       │
│  // 2.3 Ejecutar con timeout (5 segundos)                           │
│  const response = await Promise.race([                               │
│    secretsClient.send(command),                                      │
│    new Promise<never>((_, reject) =>                                 │
│      setTimeout(() =>                                                │
│        reject(new Error('Secrets Manager timeout')), 5000)           │
│    )                                                                 │
│  ]);                                                                 │
│                                                                       │
│  // 2.4 Parsear secret                                              │
│  if (!response.SecretString) {                                       │
│    throw new Error('Secret no contiene SecretString');               │
│  }                                                                   │
│                                                                       │
│  const secret = JSON.parse(response.SecretString);                   │
│  credentialsCache = { MONGODB_URI: secret.MONGODB_URI };             │
│                                                                       │
│  logger.info('Credenciales obtenidas de Secrets Manager');           │
│  return credentialsCache;                                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PASO 3: Conectar a MongoDB                              │
│                                                                       │
│  export const dbConnection = async () => {                           │
│    try {                                                             │
│      // 3.1 Obtener credenciales (cacheadas o de Secrets Manager)   │
│      const credentials = await getMongoDBCredentials();              │
│      const mongoUri = credentials.MONGODB_URI;                       │
│                                                                       │
│      // 3.2 Conectar con Mongoose                                   │
│      await mongoose.connect(mongoUri, {                              │
│        maxPoolSize: 10,     // Pool de conexiones                   │
│        minPoolSize: 2,                                               │
│      });                                                             │
│                                                                       │
│      logger.info('MongoDB connection established via Secrets Manager');│
│    } catch (error) {                                                 │
│      logger.error('Error connecting to MongoDB', error);             │
│      throw new Error('Error connecting to MongoDB');                 │
│    }                                                                 │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### **Beneficios del Cache**

| **Métrica** | **Sin Cache** | **Con Cache** | **Mejora** |
|-------------|---------------|---------------|------------|
| **Latencia** | 50-100ms | 0ms | **100%** |
| **Costo** | $0.05/1000 requests | $0.05/1000 requests (primera vez) | **Ahorro en requests subsecuentes** |
| **Reliability** | Depende de Secrets Manager | Cache local | **Mayor confiabilidad** |

---

## 📦 **Flujo Completo: Crear Producto**

### **De Cliente a Base de Datos**

```
1️⃣ CLIENTE
   └─> POST /product
       Headers: { Authorization: "Bearer <JWT>" }
       Body: {
         "name": "Laptop Dell XPS 15",
         "price": 1299.99,
         "description": "Laptop profesional con pantalla 4K",
         "categoryId": "123e4567-e89b-12d3-a456-426614174000",
         "stock": 10
       }

2️⃣ API GATEWAY
   ├─> Cognito Authorizer valida JWT (Capa 1)
   │   ├─> ✅ Token válido
   │   └─> Extrae claims (userId, email)
   ├─> Rate limiting check (100 req/s)
   │   └─> ✅ Dentro del límite
   └─> Invoca ProductService Lambda

3️⃣ PRODUCT SERVICE LAMBDA
   ├─> CognitoVerifierService re-valida JWT (Capa 2)
   │   ├─> ✅ Token válido
   │   └─> Extrae userId para logging
   │
   ├─> parseAndValidateBody(event, CreateProductSchema)
   │   ├─> Parsea JSON
   │   ├─> Valida con Zod
   │   │   ├─> name: "Laptop Dell XPS 15" ✅ (3-200 chars)
   │   │   ├─> price: 1299.99 ✅ (0.01-999999.99)
   │   │   ├─> description: "..." ✅ (max 2000 chars)
   │   │   ├─> categoryId: "123e..." ✅ (UUID válido)
   │   │   └─> stock: 10 ✅ (entero no negativo)
   │   └─> ✅ Validación exitosa
   │
   ├─> logger.info('Creando producto', {
   │     name: "Laptop Dell XPS 15",
   │     price: 1299.99,
   │     userId: "user-456",
   │     requestId: "abc-123"
   │   })
   │
   └─> ProductService.CreateProduct(data)
       ├─> Genera UUID: "prod-789"
       ├─> Asigna defaults:
       │   ├─> isActive: true
       │   └─> createdAt: "2025-11-04T10:30:00Z"
       └─> ProductRepository.CreateProduct(product)

4️⃣ PRODUCT REPOSITORY
   ├─> dbConnection() - Conecta a MongoDB
   │   ├─> getMongoDBCredentials()
   │   │   ├─> Verifica cache
   │   │   └─> Si cache miss: obtiene de Secrets Manager
   │   └─> mongoose.connect(mongoUri)
   │
   ├─> Inserta en colección "products"
   │   await ProductModel.create({
   │     _id: "prod-789",
   │     name: "Laptop Dell XPS 15",
   │     price: 1299.99,
   │     description: "...",
   │     categoryId: "123e...",
   │     stock: 10,
   │     isActive: true,
   │     createdAt: "2025-11-04T10:30:00Z"
   │   })
   │
   └─> Retorna producto creado

5️⃣ RESPUESTA AL CLIENTE
   └─> 201 Created
       {
         "success": true,
         "message": "Producto creado exitosamente",
         "data": {
           "_id": "prod-789",
           "name": "Laptop Dell XPS 15",
           "price": 1299.99,
           "description": "Laptop profesional con pantalla 4K",
           "categoryId": "123e4567-e89b-12d3-a456-426614174000",
           "stock": 10,
           "isActive": true,
           "createdAt": "2025-11-04T10:30:00.000Z"
         }
       }

6️⃣ CLOUDWATCH LOGS
   └─> [2025-11-04T10:30:00.749Z] [INFO] [ProductService]
       Producto creado
       {
         "productId": "prod-789",
         "name": "Laptop Dell XPS 15",
         "userId": "user-456",
         "requestId": "abc-123"
       }
```

### **Tiempo Total Estimado**

| **Paso** | **Tiempo** | **Acumulado** |
|----------|------------|---------------|
| API Gateway (JWT + routing) | 10-20ms | 10-20ms |
| Lambda (JWT re-validation) | 10-20ms | 20-40ms |
| Lambda (Zod validation) | 5-10ms | 25-50ms |
| Secrets Manager (primera vez) | 50-100ms | 75-150ms |
| Secrets Manager (cache hit) | 0ms | 25-50ms |
| MongoDB insert | 20-50ms | 45-100ms |
| Response | 5-10ms | 50-110ms |

**Latencia p50:** ~60ms (con cache)  
**Latencia p99:** ~150ms (sin cache)

---

## 🖼️ **Flujo Completo: Upload de Imagen**

### **Signed URL Pattern**

```
1️⃣ CLIENTE SOLICITA SIGNED URL
   └─> GET /image?fileName=laptop.jpg&contentType=image/jpeg
       Headers: { Authorization: "Bearer <JWT>" }

2️⃣ API GATEWAY
   ├─> Cognito Authorizer valida JWT
   └─> Invoca ImageService Lambda

3️⃣ IMAGE SERVICE LAMBDA
   ├─> Re-valida JWT (Defense in Depth)
   ├─> Valida query params con Zod
   │   ├─> fileName: "laptop.jpg" ✅ (extensión permitida)
   │   └─> contentType: "image/jpeg" ✅ (image/*)
   │
   ├─> Genera key único para S3
   │   const key = `products/${userId}/${Date.now()}-${fileName}`;
   │   // "products/user-456/1699012345-laptop.jpg"
   │
   ├─> Genera signed URL con S3 SDK
   │   const command = new PutObjectCommand({
   │     Bucket: 'evilent-images-prod',
   │     Key: key,
   │     ContentType: contentType,
   │   });
   │
   │   const signedUrl = await getSignedUrl(s3Client, command, {
   │     expiresIn: 300 // 5 minutos
   │   });
   │
   └─> Retorna signed URL al cliente

4️⃣ RESPUESTA AL CLIENTE
   └─> 200 OK
       {
         "success": true,
         "message": "Signed URL generada",
         "data": {
           "uploadUrl": "https://evilent-images-prod.s3.amazonaws.com/products/...",
           "imageUrl": "https://evilent-images-prod.s3.amazonaws.com/products/...",
           "expiresIn": 300
         }
       }

5️⃣ CLIENTE HACE UPLOAD DIRECTO A S3
   └─> PUT <uploadUrl>
       Headers: { Content-Type: "image/jpeg" }
       Body: <binary image data>

6️⃣ S3 ALMACENA IMAGEN
   ├─> Valida Content-Type
   ├─> Encripta imagen (AES-256)
   ├─> Almacena en bucket
   └─> Retorna 200 OK

7️⃣ CLIENTE GUARDA URL EN PRODUCTO
   └─> PUT /product/{id}
       Body: {
         "imageUrl": "https://evilent-images-prod.s3.amazonaws.com/products/..."
       }
```

### **Beneficios del Signed URL Pattern**

| **Aspecto** | **Upload via Lambda** | **Signed URL** |
|-------------|----------------------|----------------|
| **Latencia** | Alta (Lambda proxy) | Baja (directo a S3) |
| **Costo** | Lambda + S3 | Solo S3 |
| **Escalabilidad** | Limitada por Lambda | Ilimitada (S3) |
| **Seguridad** | ✅ Controlada | ✅ Controlada (expiración) |

---

## ❌ **Flujo de Manejo de Errores**

### **Jerarquía de Errores**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ERROR OCURRE                                      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  ¿Qué tipo de error?   │
                    └────────┬───────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Validation    │  │ Business      │  │ System        │
│ Error         │  │ Logic Error   │  │ Error         │
│ (400)         │  │ (404, 409)    │  │ (500)         │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│         ValidationErrorResponse                      │
│  {                                                   │
│    success: false,                                   │
│    message: "Error de validación",                   │
│    data: {                                           │
│      errors: [                                       │
│        {                                             │
│          field: "price",                             │
│          message: "El precio mínimo es 0.01",        │
│          code: "too_small"                           │
│        }                                             │
│      ]                                               │
│    }                                                 │
│  }                                                   │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│         NotFoundResponse                             │
│  {                                                   │
│    success: false,                                   │
│    message: "Producto no encontrado",                │
│    data: {                                           │
│      productId: "123e..."                            │
│    }                                                 │
│  }                                                   │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│         ErrorResponse (500)                          │
│  {                                                   │
│    success: false,                                   │
│    message: "Error interno del servidor",            │
│    data: {                                           │
│      requestId: "abc-123"                            │
│    }                                                 │
│  }                                                   │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│         CLOUDWATCH LOGS                              │
│  [ERROR] [ProductService]                            │
│  Error al crear producto                             │
│  {                                                   │
│    error: "MongoError: Connection timeout",          │
│    stack: "...",                                     │
│    userId: "user-456",                               │
│    requestId: "abc-123"                              │
│  }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 **Flujo de Logging**

### **Logger Estructurado con Contexto**

```typescript
// src/utility/logger.ts
export class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  info(message: string, data?: any): void {
    console.info(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: this.service,
      message,
      data: this.sanitize(data)
    }));
  }

  error(message: string, error: any): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: this.service,
      message,
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      }
    }));
  }

  private sanitize(data: any): any {
    // Filtrar datos sensibles (passwords, tokens, etc.)
    if (!data) return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
}
```

### **Uso en Código**

```typescript
// src/service/product-service.ts
const logger = createLogger('ProductService');

async CreateProduct(event: APIGatewayEvent) {
  const { data, error } = parseAndValidateBody(event, CreateProductSchema);
  if (error) return error;

  logger.info('Creando producto', {
    name: data.name,
    price: data.price,
    userId: event.requestContext.authorizer?.claims.sub,
    requestId: event.requestContext.requestId
  });

  try {
    const product = await this.repository.CreateProduct(data);
    
    logger.info('Producto creado exitosamente', {
      productId: product._id,
      userId: event.requestContext.authorizer?.claims.sub
    });
    
    return CreatedResponse('Producto creado', product);
  } catch (error) {
    logger.error('Error al crear producto', error);
    return ErrorResponse('Error al crear producto');
  }
}
```

---

## 🎯 **Conclusión**

Los flujos del **Product Service** están diseñados para:

✅ **Seguridad robusta** - Defense in Depth en cada capa  
✅ **Validación exhaustiva** - Type-safe con Zod  
✅ **Performance optimizado** - Cache de credenciales, connection pooling  
✅ **Observabilidad completa** - Logging estructurado con contexto  
✅ **Manejo de errores robusto** - Respuestas consistentes y descriptivas  

**Estado:** Production-Ready 🚀

---

**Mantenido por:** Equipo de desarrollo Evilent  
**Próxima revisión:** Al implementar nuevas features  
**Contacto:** [Agregar contacto del equipo]

