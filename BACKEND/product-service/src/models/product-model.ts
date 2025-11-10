import mongoose from "mongoose";

/**
 * 📦 Product Model - Modelo de productos con validaciones y índices
 * 
 * REGLA #5: Validación de datos con schemas (Defense in Depth)
 * REGLA PLATINO: Código escalable - Índices para performance
 * 
 * Validaciones implementadas:
 * - Campos requeridos con mensajes descriptivos
 * - Rangos de longitud para strings
 * - Rangos de valores para números
 * - Validación de URLs
 * - ObjectId para referencias
 * 
 * Índices implementados:
 * - name: Búsquedas por nombre
 * - category_id: Filtros por categoría
 * - price: Filtros por precio
 * - availability: Filtros por disponibilidad
 * - Índices compuestos para queries comunes
 */

type ProductModel = {
    _id: string;
    name: string;
    description: string;
    category_id: mongoose.Types.ObjectId;  // ✅ ObjectId en lugar de string
    price: number;
    image_url?: string;  // Opcional
    availability: boolean;
};

export type ProductDoc = mongoose.Document & ProductModel;

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Nombre del producto es requerido'],
        minlength: [2, 'Nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'Nombre no puede exceder 100 caracteres'],
        trim: true,
        index: true  // ✅ Índice para búsquedas por nombre
    },
    description: { 
        type: String, 
        required: [true, 'Descripción es requerida'],
        maxlength: [500, 'Descripción no puede exceder 500 caracteres'],
        trim: true
    },
    category_id: { 
        type: mongoose.Schema.Types.ObjectId,  // ✅ ObjectId en lugar de String
        ref: 'categories',
        required: [true, 'Categoría es requerida'],
        index: true  // ✅ Índice para filtros por categoría
    },
    price: { 
        type: Number, 
        required: [true, 'Precio es requerido'],
        min: [0.01, 'Precio debe ser mayor a 0'],
        max: [999999.99, 'Precio no puede exceder 999999.99'],
        index: true  // ✅ Índice para filtros por precio
    },
    image_url: { 
        type: String,
        validate: {
            validator: function(v: string) {
                // Validar URL solo si se proporciona
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'URL de imagen inválida'
        }
    },
    availability: { 
        type: Boolean, 
        required: [true, 'Disponibilidad es requerida'],
        default: true,
        index: true  // ✅ Índice para filtros por disponibilidad
    },
}, {
    toJSON: {
        transform(doc, ret: Record<string, any>){
            delete ret.__v;
            // Mantener timestamps para auditoría
        }
    },
    timestamps: true  // Agrega createdAt y updatedAt automáticamente
});

// ========================================
// ÍNDICES COMPUESTOS PARA QUERIES COMUNES
// ========================================

// ✅ Índice para filtrar por categoría y disponibilidad (query común)
ProductSchema.index({ category_id: 1, availability: 1 });

// ✅ Índice para filtrar por precio y disponibilidad (query común)
ProductSchema.index({ price: 1, availability: 1 });

// ✅ Índice para ordenar por fecha de creación (paginación)
ProductSchema.index({ createdAt: -1 });

// ✅ Índice para búsqueda de texto en nombre (opcional, para futuras búsquedas)
// ProductSchema.index({ name: 'text', description: 'text' });

const Products = mongoose.models.products || mongoose.model<ProductDoc>('products', ProductSchema);

export { Products };