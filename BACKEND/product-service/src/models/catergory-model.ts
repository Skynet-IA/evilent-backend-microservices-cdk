import mongoose from "mongoose";

/**
 * 📂 Category Model - Modelo de categorías con validaciones y índices
 * 
 * REGLA #5: Validación de datos con schemas (Defense in Depth)
 * REGLA PLATINO: Código escalable - Índices para performance
 * REGLA #9: Consistencia arquitectónica
 * 
 * Validaciones implementadas:
 * - Campos requeridos con mensajes descriptivos
 * - Rangos de longitud para strings
 * - Validación de URLs
 * - ObjectId para referencias
 * - Valores por defecto apropiados
 * 
 * Índices implementados:
 * - name: Búsquedas por nombre
 * - parentId: Filtros por categoría padre
 * - displayOrder: Ordenamiento de categorías
 * - Índices compuestos para queries jerárquicas
 */

type CategoryModel = {
    name: string;
    nameTranslations?: {  // ✅ Corregido typo: Translations
        en?: string;
        de?: string;
    };
    parentId?: mongoose.Types.ObjectId;
    subCategories: mongoose.Types.ObjectId[];
    products: mongoose.Types.ObjectId[];
    displayOrder: number;  // ✅ Corregido typo: Order
    imageUrl?: string;
};

export type CategoryDoc = mongoose.Document & CategoryModel;

const CategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Nombre de la categoría es requerido'],
        minlength: [2, 'Nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'Nombre no puede exceder 100 caracteres'],
        trim: true,
        index: true  // ✅ Índice para búsquedas por nombre
    },
    nameTranslations: {  // ✅ Corregido typo: Translations
        en: { 
            type: String,
            trim: true,
            maxlength: [100, 'Traducción en inglés no puede exceder 100 caracteres']
        },
        de: { 
            type: String,
            trim: true,
            maxlength: [100, 'Traducción en alemán no puede exceder 100 caracteres']
        }
    },
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'categories',
        default: null,
        index: true  // ✅ Índice para filtros por categoría padre
    },
    subCategories: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'categories'
    }],
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'products'
    }],
    displayOrder: {  // ✅ Corregido typo: Order
        type: Number, 
        default: 0,
        min: [0, 'Orden de visualización debe ser mayor o igual a 0'],
        index: true  // ✅ Índice para ordenamiento
    },
    imageUrl: { 
        type: String,
        validate: {
            validator: function(v: string) {
                // Validar URL solo si se proporciona
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'URL de imagen inválida'
        }
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

// ✅ Índice para obtener categorías principales ordenadas (query común)
CategorySchema.index({ parentId: 1, displayOrder: 1 });

// ✅ Índice para búsquedas jerárquicas (categorías hijas de una padre)
CategorySchema.index({ parentId: 1, name: 1 });

// ✅ Índice para ordenar por fecha de creación (paginación)
CategorySchema.index({ createdAt: -1 });

const Category = mongoose.models.category || mongoose.model<CategoryDoc>('categories', CategorySchema);

export { Category };
