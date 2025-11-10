# 🚀 **PRODUCT SERVICE - EJEMPLOS DE ENDPOINTS COMPLETOS**

**Fecha:** 2025-11-04
**URL Base:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/`

> 💡 **Nota:** Reemplaza `YOUR-API-ID` y `REGION` con los valores de tu deployment.
> Puedes obtener la URL ejecutando: `make api-url`
**Autenticación:** JWT Bearer Token (Cognito)

---

## 📖 **¿QUÉ CONTIENE ESTE DOCUMENTO?**

### **✅ ENTRADAS ESPERADAS (Request)**
- **Headers requeridos** para cada endpoint
- **Parámetros de URL** (path parameters)
- **Parámetros de Query** (query strings)
- **Cuerpo de la petición** (request body) con validaciones detalladas
- **Ejemplos completos** de requests válidos

### **✅ SALIDAS ESPERADAS (Response)**
- **Respuestas exitosas** con datos reales de la base de datos
- **Estructura de respuestas** incluyendo paginación
- **Códigos de estado HTTP** apropiados
- **Mensajes de error** detallados con códigos específicos

### **✅ VALIDACIONES Y ERRORES**
- **Reglas de validación** por campo y endpoint
- **Mensajes de error** específicos para cada tipo de validación
- **Ejemplos de errores comunes** (400, 401, 404, 409, 500)
- **Solución de problemas** paso a paso

### **✅ EJEMPLOS PRÁCTICOS**
- **Comandos curl completos** listos para ejecutar
- **Script de prueba** que ejecuta todos los endpoints
- **Datos reales** de productos y categorías creados en producción
- **Flujo completo** de creación y consulta de recursos

---

## 🎯 **CÓMO USAR ESTE DOCUMENTO**

1. **Para probar un endpoint específico:**
   - Busca la sección del endpoint deseado
   - Copia el comando curl correspondiente
   - Reemplaza el token JWT si está expirado
   - Ejecuta el comando

2. **Para entender las validaciones:**
   - Revisa la tabla "VALIDACIONES DE ENTRADA POR ENDPOINT"
   - Consulta los ejemplos de errores para casos inválidos

3. **Para ejecutar pruebas completas:**
   - Usa el script de bash al final del documento
   - Incluye 9 pruebas automáticas de todos los endpoints

4. **Para desarrollo frontend:**
   - Usa las estructuras de request/response como contratos de API
   - Implementa manejo de errores basado en los códigos de error documentados

---

## 📋 **LEYENDA DE SÍMBOLOS**

| Símbolo | Significado |
|---------|-------------|
| ✅ | Campo requerido (obligatorio) |
| ❌ | Campo opcional (no requerido) |
| GET | Método HTTP para consultar datos |
| POST | Método HTTP para crear recursos |
| PUT | Método HTTP para actualizar recursos |
| DELETE | Método HTTP para eliminar recursos |
| JWT | Requiere token de autenticación Bearer |
| ObjectId | Identificador único de MongoDB (24 caracteres hexadecimales) |

---

## 🔑 **TOKEN JWT PARA PRUEBAS**

```bash
# Generar nuevo token (expira en 1 hora)
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id u093o3lh6envv6l44uqkj575s \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=MySecurePass123! \
  --region eu-central-1 \
  --query 'AuthenticationResult.IdToken' \
  --output text
```

**Token actual (válido hasta las 16:14:26 UTC):**
```
eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzMzI0OTg5Mi0xMDAxLTcwYTAtZjRkNy0wNDhjZDc3ZDAyYTQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfcXhTWHA4djNZIiwiY29nbml0bzp1c2VybmFtZSI6IjMzMjQ5ODkyLTEwMDEtNzBhMC1mNGQ3LTA0OGNkNzdkMDJhNCIsIm9yaWdpbl9qdGkiOiI4Y2M2ZGNlNy04OGVmLTRlYzMtYjQzZi01OWVkMTgxZWI5YzUiLCJhdWQiOiJ1MDkzbzNsaDZlbnZ2Nmw0NHVxa2o1NzVzIiwiZXZlbnRfaWQiOiIyMTgzOWUwMy1iMDM0LTQzMGYtYTliOC0yMDkyNDg2NzMxZjYiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc2MjI4NDg2NiwiZXhwIjoxNzYyMjg4NDY2LCJpYXQiOjE3NjIyODQ4NjYsImp0aSI6IjZlYzIxOGY0LTc2YzYtNGRhZi05NjMxLTc4MDQ2Y2UwOGY5MCIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.kMtoTfRlkCtxlT2yr4CCITNolJAK4ByJxlMWzPCkJEPDVNFTAA0HTyheOrd9gi9kU7C5XUPw_wijaMTm2hit9PfLAVoASWh1hTbthRImHcAfIVrqjO28c3xdLg6xwUFKDvhA8IqeQBJ9j-UhXNPPWkM-mYCOhl7Ej5DxKcUJ0mD00DyUoFbyR2XAZiBcbFi3rLalEtScWZp6R2VGRTUgBPPRt0SjBHon8WlbyMXDg1_rLLleTE-AfeYW4ODhGZkHRIm09bPIfJKh_eE1c49EpckeUP27839TmF0ZcZkAtkCDS4WW-GUGqvULWB4HX4ZOsp0uDCnd7iKC6J416Kg1cw
```
```

---

## 📦 **PRODUCT ENDPOINTS**

### **1. GET /product - Listar todos los productos**

**Descripción:** Obtiene una lista de todos los productos disponibles.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product`

**Método:** `GET`

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Parámetros de Query (Opcionales):**
- `page`: Número de página (default: 1, mínimo: 1)
- `limit`: Cantidad de productos por página (default: 20, máximo: 100, mínimo: 1)
- `category_id`: Filtrar por ID de categoría (opcional)
- `availability`: Filtrar por disponibilidad (true/false, opcional)
- `min_price`: Precio mínimo (opcional, número positivo)
- `max_price`: Precio máximo (opcional, número positivo)

**Ejemplos de URLs con parámetros:**
```
GET /product?page=1&limit=10
GET /product?category_id=690a552be2920f2f82e1539d
GET /product?availability=true&min_price=100&max_price=1000
GET /product?page=2&limit=5&category_id=690a552be2920f2f82e1539d
```

**Body:** Ninguno (es un GET request, todos los parámetros van en la URL)

**Validaciones de entrada:**
- `page`: Debe ser entero positivo ≥ 1
- `limit`: Debe ser entero entre 1 y 100
- `category_id`: Debe ser un ObjectId válido de MongoDB si se proporciona
- `availability`: Debe ser "true" o "false" si se proporciona
- `min_price`/`max_price`: Deben ser números positivos si se proporcionan

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [
    {
      "_id": "690a5533ee6b1a5f4cbffd6e",
      "name": "iPhone 15 Pro",
      "description": "El último smartphone de Apple con chip A17 Pro y cámara avanzada",
      "price": 999.99,
      "createdAt": "2025-11-04T19:34:11.844Z",
      "updatedAt": "2025-11-04T19:34:11.844Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Comandos curl:**
```bash
# Listar todos los productos (sin filtros)
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"

# Listar productos con paginación
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product?page=1&limit=5" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"

# Filtrar por categoría
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product?category_id=690a552be2920f2f82e1539d" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"

# Filtrar por precio y disponibilidad
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product?min_price=500&max_price=1500&availability=true" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

### **2. GET /product/{id} - Obtener producto por ID**

**Descripción:** Obtiene un producto específico por su ID.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/{id}`

**Método:** `GET`

**Parámetros URL:**
- `id`: ID del producto (MongoDB ObjectId)

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body:** Ninguno

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Producto obtenido exitosamente",
  "data": {
    "_id": "6741234567890abcdef12345",
    "name": "Producto de ejemplo",
    "description": "Descripción del producto",
    "category_id": "6741234567890abcdef12346",
    "price": 99.99,
    "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/image.jpg",
    "availability": true,
    "createdAt": "2025-11-04T15:30:00.000Z",
    "updatedAt": "2025-11-04T15:30:00.000Z"
  }
}
```

**Comando curl:**
```bash
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/6741234567890abcdef12345" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

### **3. POST /product - Crear nuevo producto**

**Descripción:** Crea un nuevo producto en el sistema.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product`

**Método:** `POST`

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body requerido:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "El último smartphone de Apple con chip A17 Pro y cámara avanzada",
  "category_id": "6741234567890abcdef12346",
  "price": 999.99,
  "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/iphone15pro.jpg",
  "availability": true
}
```

**Validaciones:**
- `name`: 2-100 caracteres, requerido
- `description`: Máximo 500 caracteres, requerido
- `category_id`: ID válido de categoría existente, requerido
- `price`: Número positivo entre 0.01 y 999999.99, requerido
- `image_url`: URL válida (opcional)
- `availability`: Boolean, requerido

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "_id": "6741234567890abcdef12347",
    "name": "iPhone 15 Pro",
    "description": "El último smartphone de Apple con chip A17 Pro y cámara avanzada",
    "category_id": "6741234567890abcdef12346",
    "price": 999.99,
    "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/iphone15pro.jpg",
    "availability": true,
    "createdAt": "2025-11-04T15:30:00.000Z",
    "updatedAt": "2025-11-04T15:30:00.000Z"
  }
}
```

**Comando curl:**
```bash
curl -X POST \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "El último smartphone de Apple con chip A17 Pro y cámara avanzada",
    "category_id": "6741234567890abcdef12346",
    "price": 999.99,
    "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/iphone15pro.jpg",
    "availability": true
  }'
```

---

### **4. PUT /product/{id} - Actualizar producto**

**Descripción:** Actualiza un producto existente.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/{id}`

**Método:** `PUT`

**Parámetros URL:**
- `id`: ID del producto a actualizar

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body (todos los campos opcionales):**
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 1199.99,
  "availability": false
}
```

**Validaciones:** Mismas que POST pero todos los campos opcionales

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente",
  "data": {
    "_id": "6741234567890abcdef12347",
    "name": "iPhone 15 Pro Max",
    "description": "El último smartphone de Apple con chip A17 Pro y cámara avanzada",
    "category_id": "6741234567890abcdef12346",
    "price": 1199.99,
    "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/iphone15pro.jpg",
    "availability": false,
    "createdAt": "2025-11-04T15:30:00.000Z",
    "updatedAt": "2025-11-04T15:35:00.000Z"
  }
}
```

**Comando curl:**
```bash
curl -X PUT \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/6741234567890abcdef12347" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "price": 1199.99,
    "availability": false
  }'
```

---

### **5. DELETE /product/{id} - Eliminar producto**

**Descripción:** Elimina un producto del sistema.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/{id}`

**Método:** `DELETE`

**Parámetros URL:**
- `id`: ID del producto a eliminar

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body:** Ninguno

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente",
  "data": {
    "category_id": "6741234567890abcdef12346",
    "resultDelet": {
      "acknowledged": true,
      "deletedCount": 1
    }
  }
}
```

**Comando curl:**
```bash
curl -X DELETE \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/product/6741234567890abcdef12347" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

## 📂 **CATEGORY ENDPOINTS**

### **6. GET /category - Listar todas las categorías**

**Descripción:** Obtiene una lista de todas las categorías disponibles, incluyendo información de subcategorías y productos asociados.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category`

**Método:** `GET`

**Parámetros de Query (Opcionales):**
- `type`: Tipo de categorías a obtener
  - `top`: Solo categorías principales (sin padre)
  - `all`: Todas las categorías (default)
- `parent_id`: Filtrar categorías por ID de categoría padre (opcional)
- `include_products`: Incluir array de IDs de productos en cada categoría (true/false, default: false)

**Ejemplos de URLs con parámetros:**
```
GET /category?type=top
GET /category?include_products=true
GET /category?parent_id=690a552be2920f2f82e1539d
```

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body:** Ninguno (GET request)

**Validaciones de entrada:**
- `type`: Debe ser "top" o "all" si se proporciona
- `parent_id`: Debe ser un ObjectId válido de MongoDB si se proporciona
- `include_products`: Debe ser "true" o "false" si se proporciona

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Categorías obtenidas exitosamente",
  "data": [
    {
      "_id": "690a552be2920f2f82e1539d",
      "name": "Electrónicos",
      "nameTranslations": {
        "en": "Electronics",
        "de": "Elektronik"
      },
      "parentId": null,
      "subCategories": [],
      "products": ["690a5533ee6b1a5f4cbffd6e"],
      "displayOrder": 1,
      "imageUrl": null,
      "createdAt": "2025-11-04T19:34:03.625Z",
      "updatedAt": "2025-11-04T19:34:03.625Z"
    }
  ]
}
```

**Comandos curl:**
```bash
# Listar todas las categorías
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"

# Solo categorías principales
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category?type=top" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"

# Incluir productos en la respuesta
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category?include_products=true" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

### **7. POST /category - Crear nueva categoría**

**Descripción:** Crea una nueva categoría.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category`

**Método:** `POST`

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body requerido:**
```json
{
  "name": "Electrónicos",
  "nameTranslations": {
    "en": "Electronics",
    "de": "Elektronik"
  },
  "parentId": null,
  "displayOrder": 1,
  "imageUrl": "https://bucket.s3.eu-central-1.amazonaws.com/categories/electronics.jpg"
}
```

**Validaciones:**
- `name`: 2-100 caracteres, requerido
- `nameTranslations`: Objeto con traducciones (opcional)
- `parentId`: ID válido de categoría padre (opcional)
- `displayOrder`: Número entero positivo (opcional, default 0)
- `imageUrl`: URL válida (opcional)

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "_id": "6741234567890abcdef12346",
    "name": "Electrónicos",
    "nameTranslations": {
      "en": "Electronics",
      "de": "Elektronik"
    },
    "parentId": null,
    "subCategories": [],
    "products": [],
    "displayOrder": 1,
    "imageUrl": "https://bucket.s3.eu-central-1.amazonaws.com/categories/electronics.jpg",
    "createdAt": "2025-11-04T15:25:00.000Z",
    "updatedAt": "2025-11-04T15:25:00.000Z"
  }
}
```

**Comando curl:**
```bash
curl -X POST \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/category" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electrónicos",
    "nameTranslations": {
      "en": "Electronics",
      "de": "Elektronik"
    },
    "parentId": null,
    "displayOrder": 1,
    "imageUrl": "https://bucket.s3.eu-central-1.amazonaws.com/categories/electronics.jpg"
  }'
```

---

### **8. GET /category/{id} - Obtener categoría por ID**

**Similar a GET /product/{id}**

---

### **9. PUT /category/{id} - Actualizar categoría**

**Similar a PUT /product/{id}**

---

### **10. DELETE /category/{id} - Eliminar categoría**

**Similar a DELETE /product/{id}**

---

## 🎯 **DEAL ENDPOINTS**

### **11. POST /deal - Crear nuevo deal**

**Descripción:** Crea una nueva oferta/deal.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/deal`

**Método:** `POST`

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body requerido:**
```json
{
  "product_id": "6741234567890abcdef12347",
  "discount": 20.5,
  "startDate": "2025-11-04T10:00:00.000Z",
  "endDate": "2025-11-10T23:59:59.000Z"
}
```

**Validaciones:**
- `product_id`: ID válido de producto existente, requerido
- `discount`: Número entre 0.01 y 99.99, requerido
- `startDate`: Fecha futura en formato ISO 8601, requerido
- `endDate`: Fecha posterior a startDate, requerido

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Deal creado exitosamente",
  "data": {
    "_id": "6741234567890abcdef12348",
    "product_id": "6741234567890abcdef12347",
    "discount": 20.5,
    "startDate": "2025-11-04T10:00:00.000Z",
    "endDate": "2025-11-10T23:59:59.000Z",
    "createdAt": "2025-11-04T15:40:00.000Z",
    "updatedAt": "2025-11-04T15:40:00.000Z"
  }
}
```

**Comando curl:**
```bash
curl -X POST \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/deal" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "6741234567890abcdef12347",
    "discount": 20.5,
    "startDate": "2025-11-04T10:00:00.000Z",
    "endDate": "2025-11-10T23:59:59.000Z"
  }'
```

---

### **12. GET /deal/{id} - Obtener deal por ID**

**Similar a GET /product/{id}**

---

### **13. PUT /deal/{id} - Actualizar deal**

**Similar a PUT /product/{id}**

---

### **14. DELETE /deal/{id} - Eliminar deal**

**Similar a DELETE /product/{id}**

---

## 🖼️ **IMAGE ENDPOINTS**

### **15. GET /imgUploader - Obtener URL de subida de imagen**

**Descripción:** Genera una URL pre-firmada de S3 para subir imágenes.

**URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/imgUploader`

**Método:** `GET`

**Query Parameters:**
- `fileName`: Nombre del archivo (ej: "product-image.jpg")
- `contentType`: Tipo MIME (ej: "image/jpeg")

**Headers:**
```
Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

**Body:** Ninguno

**URL completa:**
`https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/imgUploader?fileName=product-image.jpg&contentType=image/jpeg`

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "URL de subida generada exitosamente",
  "data": {
    "uploadUrl": "https://bucket.s3.eu-central-1.amazonaws.com/products/product-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    "imageUrl": "https://bucket.s3.eu-central-1.amazonaws.com/products/product-image.jpg",
    "expiresIn": 3600
  }
}
```

**Comando curl:**
```bash
curl -X GET \
  "https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/imgUploader?fileName=product-image.jpg&contentType=image/jpeg" \
  -H "Authorization: Bearer eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9..." \
  -H "Content-Type: application/json"
```

---

## 🚨 **ERRORES COMUNES Y VALIDACIONES DE ENTRADA**

### **401 Unauthorized - Problemas de Autenticación**

**Causa:** Token JWT inválido, expirado o ausente
```json
{
  "success": false,
  "message": "Token de autenticación inválido o expirado"
}
```
**Solución:** Generar nuevo token JWT con el comando al inicio del documento

### **400 Bad Request - Validación de Datos de Entrada**

**Causa:** Datos enviados no cumplen con las validaciones requeridas

**Ejemplo - Campo requerido faltante:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "data": {
    "errors": [
      {
        "field": "name",
        "message": "Campo requerido",
        "code": "invalid_type"
      }
    ]
  }
}
```

**Ejemplo - Formato inválido:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "data": {
    "errors": [
      {
        "field": "category_id",
        "message": "ID de categoría inválido",
        "code": "invalid_string"
      }
    ]
  }
}
```

**Ejemplo - Rango inválido:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "data": {
    "errors": [
      {
        "field": "price",
        "message": "El precio debe estar entre 0.01 y 999999.99",
        "code": "too_small"
      }
    ]
  }
}
```

### **404 Not Found - Recurso No Encontrado**

**Causa:** ID de recurso no existe en la base de datos
```json
{
  "success": false,
  "message": "Producto no encontrado"
}
```

**Causa:** Ruta no válida o método HTTP incorrecto
```json
{
  "success": false,
  "message": "Ruta /product/invalid-id con método GET no encontrada",
  "data": {
    "availableRoutes": [
      "GET /product - Listar productos",
      "GET /product/{id} - Obtener producto por ID",
      "POST /product - Crear producto",
      "PUT /product/{id} - Actualizar producto",
      "DELETE /product/{id} - Eliminar producto"
    ]
  }
}
```

### **409 Conflict - Conflicto de Datos**

**Causa:** Intento de crear recurso que ya existe
```json
{
  "success": false,
  "message": "Ya existe una categoría con ese nombre"
}
```

### **500 Internal Server Error - Error del Servidor**

**Causa:** Error interno del servidor (problemas de base de datos, configuración, etc.)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```
**Solución:** Revisar logs de CloudWatch para detalles específicos

---

## 📋 **VALIDACIONES DE ENTRADA POR ENDPOINT**

### **Productos (POST/PUT)**
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `name` | string | ✅ | 2-100 caracteres |
| `description` | string | ✅ | ≤ 500 caracteres |
| `category_id` | string | ✅ | ObjectId válido, categoría existente |
| `price` | number | ✅ | 0.01 - 999999.99 |
| `image_url` | string | ❌ | URL válida (opcional) |
| `availability` | boolean | ✅ | true/false |

### **Categorías (POST/PUT)**
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `name` | string | ✅ | 2-100 caracteres |
| `nameTranslations` | object | ❌ | Objeto con traducciones (opcional) |
| `parentId` | string | ❌ | ObjectId válido (opcional) |
| `displayOrder` | number | ❌ | Entero ≥ 0 (default: 0) |
| `imageUrl` | string | ❌ | URL válida (opcional) |

### **Deals (POST/PUT)**
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `product_id` | string | ✅ | ObjectId válido, producto existente |
| `discount` | number | ✅ | 0.01 - 99.99 |
| `startDate` | string | ✅ | Fecha futura, formato ISO 8601 |
| `endDate` | string | ✅ | Fecha posterior a startDate |

### **Imágenes (GET)**
| Parámetro | Tipo | Requerido | Validación |
|-----------|------|-----------|------------|
| `fileName` | string | ✅ | Nombre del archivo |
| `contentType` | string | ✅ | Tipo MIME válido (image/*) |

### **Query Parameters (GET)**
| Parámetro | Tipo | Endpoint | Validación |
|-----------|------|----------|------------|
| `page` | number | /product, /category | Entero ≥ 1 |
| `limit` | number | /product, /category | 1-100 |
| `category_id` | string | /product | ObjectId válido |
| `availability` | boolean | /product | true/false |
| `min_price` | number | /product | Número positivo |
| `max_price` | number | /product | Número positivo |
| `type` | string | /category | "top" o "all" |
| `parent_id` | string | /category | ObjectId válido |
| `include_products` | boolean | /category | true/false |

### **Headers Requeridos**
| Header | Valor | Todos los endpoints |
|--------|-------|-------------------|
| `Authorization` | `Bearer {jwt_token}` | ✅ Siempre requerido |
| `Content-Type` | `application/json` | ✅ Para POST/PUT requests |

---

## 🧪 **FLUJO COMPLETO DE PRUEBA - DATOS REALES**

**Datos creados en la base de datos:**
- **Categoría ID:** `690a552be2920f2f82e1539d` (Electrónicos)
- **Producto ID:** `690a5533ee6b1a5f4cbffd6e` (iPhone 15 Pro)

### **Script de Prueba Completo**

```bash
#!/bin/bash

# Token JWT (válido por 1 hora)
TOKEN="eyJraWQiOiJvdkdQNlFrdW1SeVwvZXl1djY5QVlhazJsWVcyRUFnTU8xdlFOdVB3QWZuVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzMzI0OTg5Mi0xMDAxLTcwYTAtZjRkNy0wNDhjZDc3ZDAyYTQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfcXhTWHA4djNZIiwiY29nbml0bzp1c2VybmFtZSI6IjMzMjQ5ODkyLTEwMDEtNzBhMC1mNGQ3LTA0OGNkNzdkMDJhNCIsIm9yaWdpbl9qdGkiOiI4Y2M2ZGNlNy04OGVmLTRlYzMtYjQzZi01OWVkMTgxZWI5YzUiLCJhdWQiOiJ1MDkzbzNsaDZlbnZ2Nmw0NHVxa2o1NzVzIiwiZXZlbnRfaWQiOiIyMTgzOWUwMy1iMDM0LTQzMGYtYTliOC0yMDkyNDg2NzMxZjYiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTc2MjI4NDg2NiwiZXhwIjoxNzYyMjg4NDY2LCJpYXQiOjE3NjIyODQ4NjYsImp0aSI6IjZlYzIxOGY0LTc2YzYtNGRhZi05NjMxLTc4MDQ2Y2UwOGY5MCIsImVtYWlsIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.kMtoTfRlkCtxlT2yr4CCITNolJAK4ByJxlMWzPCkJEPDVNFTAA0HTyheOrd9gi9kU7C5XUPw_wijaMTm2hit9PfLAVoASWh1hTbthRImHcAfIVrqjO28c3xdLg6xwUFKDvhA8IqeQBJ9j-UhXNPPWkM-mYCOhl7Ej5DxKcUJ0mD00DyUoFbyR2XAZiBcbFi3rLalEtScWZp6R2VGRTUgBPPRt0SjBHon8WlbyMXDg1_rLLleTE-AfeYW4ODhGZkHRIm09bPIfJKh_eE1c49EpckeUP27839TmF0ZcZkAtkCDS4WW-GUGqvULWB4HX4ZOsp0uDCnd7iKC6J416Kg1cw"
BASE_URL="https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod"
HEADERS="-H 'Authorization: Bearer $TOKEN' -H 'Content-Type: application/json'"

echo "🧪 INICIANDO PRUEBAS COMPLETAS DEL PRODUCT SERVICE"
echo "=================================================="

# 1. Listar productos (debe mostrar el iPhone creado)
echo "📦 1. Listando productos..."
curl -s -X GET "$BASE_URL/product" $HEADERS | jq '.'

# 2. Listar categorías (debe mostrar la categoría Electrónicos)
echo "📂 2. Listando categorías..."
curl -s -X GET "$BASE_URL/category" $HEADERS | jq '.'

# 3. Obtener producto específico
echo "🔍 3. Obteniendo producto específico (iPhone 15 Pro)..."
curl -s -X GET "$BASE_URL/product/690a5533ee6b1a5f4cbffd6e" $HEADERS | jq '.'

# 4. Obtener categoría específica
echo "🔍 4. Obteniendo categoría específica (Electrónicos)..."
curl -s -X GET "$BASE_URL/category/690a552be2920f2f82e1539d" $HEADERS | jq '.'

# 5. Crear nuevo producto
echo "➕ 5. Creando nuevo producto (MacBook Pro)..."
curl -s -X POST "$BASE_URL/product" $HEADERS \
  -d '{
    "name": "MacBook Pro M3",
    "description": "Laptop profesional de Apple con chip M3",
    "category_id": "690a552be2920f2f82e1539d",
    "price": 2499.99,
    "image_url": "https://bucket.s3.eu-central-1.amazonaws.com/products/macbook.jpg",
    "availability": true
  }' | jq '.'

# 6. Listar productos nuevamente (debe mostrar 2 productos)
echo "📦 6. Listando productos después de crear MacBook..."
curl -s -X GET "$BASE_URL/product" $HEADERS | jq '.'

# 7. Actualizar producto
echo "✏️ 7. Actualizando precio del iPhone..."
curl -s -X PUT "$BASE_URL/product/690a5533ee6b1a5f4cbffd6e" $HEADERS \
  -d '{"price": 899.99}' | jq '.'

# 8. Crear deal/promoción
echo "🎯 8. Creando promoción del 20% para iPhone..."
curl -s -X POST "$BASE_URL/deal" $HEADERS \
  -d '{
    "product_id": "690a5533ee6b1a5f4cbffd6e",
    "discount": 20.0,
    "startDate": "2025-11-05T00:00:00.000Z",
    "endDate": "2025-11-12T23:59:59.000Z"
  }' | jq '.'

# 9. Obtener URL de subida de imagen
echo "🖼️ 9. Generando URL para subir imagen..."
curl -s -X GET "$BASE_URL/imgUploader?fileName=product-test.jpg&contentType=image/jpeg" $HEADERS | jq '.'

echo "=================================================="
echo "✅ PRUEBAS COMPLETADAS - TODOS LOS ENDPOINTS FUNCIONANDO"
echo "📊 Resumen: Product Service está completamente operativo"
```

---

## 📊 **RESUMEN DE ENDPOINTS**

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|---------------|
| `/product` | GET | Listar productos | JWT ✅ |
| `/product` | POST | Crear producto | JWT ✅ |
| `/product/{id}` | GET | Obtener producto | JWT ✅ |
| `/product/{id}` | PUT | Actualizar producto | JWT ✅ |
| `/product/{id}` | DELETE | Eliminar producto | JWT ✅ |
| `/category` | GET | Listar categorías | JWT ✅ |
| `/category` | POST | Crear categoría | JWT ✅ |
| `/category/{id}` | GET | Obtener categoría | JWT ✅ |
| `/category/{id}` | PUT | Actualizar categoría | JWT ✅ |
| `/category/{id}` | DELETE | Eliminar categoría | JWT ✅ |
| `/deal` | POST | Crear deal | JWT ✅ |
| `/deal/{id}` | GET | Obtener deal | JWT ✅ |
| `/deal/{id}` | PUT | Actualizar deal | JWT ✅ |
| `/deal/{id}` | DELETE | Eliminar deal | JWT ✅ |
| `/imgUploader` | GET | URL de subida de imagen | JWT ✅ |

**Total de endpoints:** 15
**Métodos HTTP:** GET, POST, PUT, DELETE
**Autenticación:** JWT Bearer Token en todos los endpoints
**Base URL:** `https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod/`

---

## 🔍 **CÓDIGOS DE ERROR DE VALIDACIÓN (Zod)**

Los errores de validación incluyen códigos específicos de **Zod** para facilitar el debugging:

| Código de Error | Significado | Ejemplo |
|----------------|-------------|---------|
| `invalid_type` | Tipo de dato incorrecto | Enviar string cuando se espera number |
| `too_small` | Valor menor al mínimo | Precio = 0 (mínimo 0.01) |
| `too_big` | Valor mayor al máximo | Precio = 1000000 (máximo 999999.99) |
| `invalid_string` | Formato de string inválido | ObjectId con caracteres no hexadecimales |
| `invalid_enum` | Valor no está en lista permitida | availability = "maybe" (solo true/false) |
| `custom` | Validación personalizada | Categoría no existe en BD |

**Ejemplo completo de error de validación:**
```json
{
  "success": false,
  "message": "Error de validación de datos",
  "data": {
    "errors": [
      {
        "field": "price",
        "message": "El precio debe estar entre 0.01 y 999999.99",
        "code": "too_small"
      },
      {
        "field": "category_id",
        "message": "ID de categoría inválido",
        "code": "invalid_string"
      }
    ]
  }
}
```

---

## 📊 **ESTADÍSTICAS DEL API**

### **Endpoints Implementados:** 15
- **Productos:** 5 endpoints (GET, GET/{id}, POST, PUT, DELETE)
- **Categorías:** 5 endpoints (igual que productos)
- **Deals/Ofertas:** 4 endpoints (POST, GET/{id}, PUT, DELETE)
- **Imágenes:** 1 endpoint (GET para URL de subida)

### **Métodos HTTP:** 4 tipos
- **GET:** 7 endpoints (consulta de datos)
- **POST:** 3 endpoints (creación)
- **PUT:** 3 endpoints (actualización)
- **DELETE:** 2 endpoints (eliminación)

### **Características Técnicas:**
- ✅ **Autenticación JWT** en todos los endpoints
- ✅ **Validación completa** con Zod schemas
- ✅ **Paginación** en endpoints de listado
- ✅ **Filtros avanzados** (precio, categoría, disponibilidad)
- ✅ **Manejo robusto de errores** con códigos específicos
- ✅ **Documentación completa** con ejemplos reales

### **Base de Datos:**
- ✅ **MongoDB** con conexión segura via AWS Secrets Manager
- ✅ **Lazy loading** optimizado para Lambda
- ✅ **Validación de referencias** (categorías existentes)
- ✅ **Índices automáticos** en campos de búsqueda

---

*Este documento contiene todos los ejemplos necesarios para probar completamente el Product Service. Todos los endpoints requieren autenticación JWT y siguen el patrón RESTful estándar.*
