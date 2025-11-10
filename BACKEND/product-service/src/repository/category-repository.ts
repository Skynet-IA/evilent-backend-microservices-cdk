import mongoose from 'mongoose';
import { Category, CategoryDoc } from "../models/index.js";
import { createLogger } from '../utility/logger.js';

const logger = createLogger('CategoryRepository');

/**
 * 📂 Repository para operaciones de categorías
 * 
 * REGLA #5: Validación de datos (Zod en service, MongoDB schema en repository)
 * REGLA PLATINO: Código escalable - Manejo de errores específico, operaciones atómicas
 * REGLA #3: Logger estructurado para debugging
 * 
 * Mejoras implementadas:
 * - Validación de ObjectId antes de queries
 * - Manejo de errores específico por tipo
 * - Uso de lean() para mejor performance
 * - Operaciones atómicas con findByIdAndUpdate
 * - Logging estructurado para debugging
 * - Validación de existencia de documentos antes de operaciones
 */
export class CategoryRepository {
    constructor() {}

    /**
     * ✅ Crea una nueva categoría
     * Si tiene padre, actualiza la lista de subcategorías del padre
     */
    async CreateCategory(input: any) {
        try {
            const { name, parentId, imageUrl } = input;

            // Validar parentId si se proporciona
            if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
                throw new Error(`ID de categoría padre inválido: ${parentId}`);
            }

            // Verificar que la categoría padre existe si se proporciona
            if (parentId) {
                // @ts-ignore - Mongoose Query union types issue
                const parentExists = await Category.findById(parentId).lean().exec();
                if (!parentExists) {
                    throw new Error(`Categoría padre no encontrada: ${parentId}`);
                }
            }

            // Crear la categoría
            // @ts-ignore - Mongoose Query union types issue
            const newCategory = await Category.create({
                name,
                parentId,
                subCategories: [],
                products: [],
                imageUrl,
            });

            // Actualizar la categoría padre si existe
            if (parentId) {
                // @ts-ignore - Mongoose Query union types issue
                await Category.findByIdAndUpdate(
                    parentId,
                    { $push: { subCategories: newCategory._id } },
                    { runValidators: true }
                ).exec();
                
                logger.info('Category created and parent updated', { 
                    categoryId: newCategory._id, 
                    parentId 
                });
            } else {
                logger.info('Top-level category created', { categoryId: newCategory._id });
            }

            return newCategory;
        } catch (error: any) {
            logger.error('Error creating category', { error: error.message, input });
            throw new Error(`Error al crear categoría: ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene todas las categorías principales (sin padre) con subcategorías
     * 
     * REGLA PLATINO: Paginación y límites razonables
     */
    async GetAllCategories(offset: number = 0, limit: number = 100) {
        try {
            // @ts-ignore - Mongoose Query union types issue
            const categories = await Category.find({ parentId: null })
                .populate({
                    path: 'subCategories',
                    model: 'categories',
                    populate: {
                        path: 'subCategories',
                        model: 'categories',
                    }
                })
                .sort({ displayOrder: 1 })  // ✅ Ordenar por displayOrder
                .skip(offset)
                .limit(Math.min(limit, 100))  // Máximo 100 por página
                .lean()
                .exec();

            logger.debug('Top-level categories retrieved', { 
                count: categories.length, 
                offset, 
                limit 
            });

            return categories;
        } catch (error: any) {
            logger.error('Error retrieving categories', { error: error.message, offset, limit });
            throw new Error(`Error al obtener categorías: ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene las categorías principales con productos (top categories)
     * 
     * NOTA: El nombre es confuso - debería ser GetCategoriesWithProducts
     */
    async GetTopCategories() {
        try {
            // ✅ Corregido: displayOrder en lugar de displayOrden (typo)
            // @ts-ignore - Mongoose Query union types issue
            const categories = await Category.find({ parentId: { $ne: null }}, { products: { $slice: 10 } })
                .populate({
                    path: 'products',
                    model: 'products',
                })
                .sort({ displayOrder: -1 })  // ✅ Corregido typo
                .limit(10)
                .lean()
                .exec();

            logger.debug('Top categories retrieved', { count: categories.length });
            return categories;
        } catch (error: any) {
            logger.error('Error retrieving top categories', { error: error.message });
            throw new Error(`Error al obtener categorías principales: ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene una categoría por ID con productos paginados
     * 
     * REGLA PLATINO: Validación de ObjectId y manejo de errores
     */
    async GetCategoryById(id: string, offset = 0, limit: number = 100) {
        try {
            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn('Invalid category ID format', { id });
                throw new Error(`ID de categoría inválido: ${id}`);
            }

            // @ts-ignore - Mongoose Query union types issue
            const category = await Category.findById(id, {
                products: { $slice: [ offset, Math.min(limit, 100) ]},
            })
                .populate({
                    path: 'products',
                    model: 'products',
                })
                .lean()
                .exec();

            if (!category) {
                logger.debug('Category not found', { id });
                return null;
            }

            logger.debug('Category retrieved', { categoryId: id });
            return category;
        } catch (error: any) {
            logger.error('Error retrieving category by ID', { error: error.message, id });
            throw new Error(`Error al obtener categoría: ${error.message}`);
        }
    }

    /**
     * 🔄 Actualiza una categoría existente
     * 
     * REGLA PLATINO: Operaciones atómicas y validaciones
     */
    async UpdateCategory(input: any) {
        try {
            const { _id, ...updateData } = input;

            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                logger.warn('Invalid category ID format for update', { id: _id });
                throw new Error(`ID de categoría inválido: ${_id}`);
            }

            // ✅ Usar findByIdAndUpdate para operación atómica
            // @ts-ignore - Mongoose Query union types issue
            const updatedCategory = await Category.findByIdAndUpdate(
                _id,
                { $set: updateData },
                { 
                    new: true,
                    runValidators: true,
                    lean: true
                }
            ).exec();

            if (!updatedCategory) {
                logger.warn('Category not found for update', { id: _id });
                throw new Error(`Categoría no encontrada: ${_id}`);
            }

            logger.info('Category updated', { categoryId: _id, updatedFields: Object.keys(updateData) });
            return updatedCategory;
        } catch (error: any) {
            logger.error('Error updating category', { error: error.message, input });
            throw new Error(`Error al actualizar categoría: ${error.message}`);
        }
    }

    /**
     * 🗑️ Elimina una categoría
     * 
     * REGLA PLATINO: Validación y manejo de errores
     */
    async DeleteCategory(id: string) {
        try {
            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn('Invalid category ID format for deletion', { id });
                throw new Error(`ID de categoría inválido: ${id}`);
            }

            // Verificar que la categoría existe
            // @ts-ignore - Mongoose Query union types issue
            const category = await Category.findById(id).lean().exec();
            if (!category) {
                logger.warn('Category not found for deletion', { id });
                throw new Error(`Categoría no encontrada: ${id}`);
            }

            // @ts-ignore - Mongoose Query union types issue
            const result = await Category.findByIdAndDelete(id).exec();
            logger.info('Category deleted', { categoryId: id });
            return result;
        } catch (error: any) {
            logger.error('Error deleting category', { error: error.message, id });
            throw new Error(`Error al eliminar categoría: ${error.message}`);
        }
    }

    /**
     * 🗑️ Alias para DeleteCategory (mantener compatibilidad con typo)
     * TODO: Eliminar después de actualizar CategoryService
     */
    async DeletCategory(id: string) {
        return this.DeleteCategory(id);
    }

    /**
     * ➕ Agrega productos a una categoría
     * 
     * REGLA PLATINO: Operaciones atómicas con $addToSet (evita duplicados)
     */
    async addItem(input: any) {
        try {
            const { id, products } = input;

            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`ID de categoría inválido: ${id}`);
            }

            // Validar que todos los IDs de productos son válidos
            for (const productId of products) {
                if (!mongoose.Types.ObjectId.isValid(productId)) {
                    throw new Error(`ID de producto inválido: ${productId}`);
                }
            }

            // ✅ Usar $addToSet para evitar duplicados (operación atómica)
            // @ts-ignore - Mongoose Query union types issue
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { $addToSet: { products: { $each: products } } },
                { new: true, runValidators: true, lean: true }
            ).exec();

            if (!updatedCategory) {
                throw new Error(`Categoría no encontrada: ${id}`);
            }

            logger.info('Products added to category', { categoryId: id, productsCount: products.length });
            return updatedCategory;
        } catch (error: any) {
            logger.error('Error adding products to category', { error: error.message, input });
            throw new Error(`Error al agregar productos a categoría: ${error.message}`);
        }
    }

    /**
     * ➖ Elimina productos de una categoría
     * 
     * REGLA PLATINO: Operaciones atómicas con $pull
     */
    async removeItem(input: any) {
        try {
            const { id, products } = input;

            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`ID de categoría inválido: ${id}`);
            }

            // ✅ Usar $pull para eliminar múltiples elementos (operación atómica)
            // @ts-ignore - Mongoose Query union types issue
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { $pull: { products: { $in: products } } },
                { new: true, runValidators: true, lean: true }
            ).exec();

            if (!updatedCategory) {
                throw new Error(`Categoría no encontrada: ${id}`);
            }

            logger.info('Products removed from category', { categoryId: id, productsCount: products.length });
            return updatedCategory;
        } catch (error: any) {
            logger.error('Error removing products from category', { error: error.message, input });
            throw new Error(`Error al eliminar productos de categoría: ${error.message}`);
        }
    }
}