import mongoose from 'mongoose';
import { ProductDoc, Products } from "../models/index.js";
import { createLogger } from '../utility/logger.js';

const logger = createLogger('ProductRepository');

/**
 * 📦 Repository para operaciones de productos
 * 
 * REGLA #5: Validación de datos (Zod en service, MongoDB schema en repository)
 * REGLA PLATINO: Código escalable - Paginación eficiente, manejo de errores específico
 * REGLA #3: Logger estructurado para debugging
 * 
 * Mejoras implementadas:
 * - Validación de ObjectId antes de queries
 * - Paginación eficiente con sort + limit (no skip para offsets grandes)
 * - Manejo de errores específico por tipo
 * - Uso de lean() para mejor performance
 * - Operaciones atómicas con findByIdAndUpdate
 * - Logging estructurado para debugging
 */
export class ProductRepository {
    constructor() {}

    /**
     * ✅ Crea un nuevo producto
     * MongoDB schema valida los datos automáticamente
     */
    async CreateProduct(input: any): Promise<ProductDoc> {
        try {
            // @ts-ignore - Mongoose Query union types issue
            const product = await Products.create(input);
            logger.info('Product created', { productId: product._id });
            return product;
        } catch (error: any) {
            logger.error('Error creating product', { error: error.message, input });
            throw new Error(`Error al crear producto: ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene productos con paginación eficiente y filtros
     * 
     * REGLA PLATINO: Paginación escalable
     * - Límite razonable por defecto (20)
     * - Máximo 100 por página
     * - Sort para resultados consistentes
     * - lean() para mejor performance
     * - Filtros opcionales por categoría, disponibilidad, precio
     */
    async GetAllProducts(
        offset = 0, 
        limit = 20,
        filters?: {
            category_id?: string;
            availability?: boolean;
            min_price?: number;
            max_price?: number;
        }
    ) {
        try {
            const query: any = {};
            
            // Aplicar filtros si existen
            if (filters?.category_id) {
                // Validar ObjectId antes de usar
                if (!mongoose.Types.ObjectId.isValid(filters.category_id)) {
                    throw new Error(`ID de categoría inválido: ${filters.category_id}`);
                }
                query.category_id = filters.category_id;
            }
            
            if (filters?.availability !== undefined) {
                query.availability = filters.availability;
            }
            
            if (filters?.min_price || filters?.max_price) {
                query.price = {};
                if (filters.min_price) query.price.$gte = filters.min_price;
                if (filters.max_price) query.price.$lte = filters.max_price;
            }

            // ✅ Usar sort + limit para mejor performance
            // @ts-ignore - Mongoose Query union types issue
            const products = await Products.find(query)
                .sort({ createdAt: -1 })  // Ordenar por fecha de creación (más recientes primero)
                .skip(offset)
                .limit(Math.min(limit, 100))  // Máximo 100 por página
                .lean()  // Retornar objetos planos (más rápido)
                .exec();

            logger.debug('Products retrieved', { 
                count: products.length, 
                offset, 
                limit,
                filters 
            });

            return products;
        } catch (error: any) {
            logger.error('Error retrieving products', { error: error.message, offset, limit, filters });
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene productos con cursor-based pagination (mejor para offsets grandes)
     * 
     * REGLA PLATINO: Paginación escalable para producción
     * - Usa _id como cursor (más eficiente que skip)
     * - Ideal para "infinite scroll" o paginación profunda
     */
    async GetProductsCursor(
        lastId?: string,
        limit = 20,
        filters?: {
            category_id?: string;
            availability?: boolean;
            min_price?: number;
            max_price?: number;
        }
    ) {
        try {
            const query: any = { ...filters };
            
            if (lastId) {
                // Validar ObjectId
                if (!mongoose.Types.ObjectId.isValid(lastId)) {
                    throw new Error(`ID de cursor inválido: ${lastId}`);
                }
                query._id = { $gt: lastId };  // ✅ Usar _id como cursor
            }

            // @ts-ignore - Mongoose Query union types issue
            const products = await Products.find(query)
                .sort({ _id: 1 })
                .limit(Math.min(limit, 100))
                .lean()
                .exec();

            logger.debug('Products retrieved (cursor-based)', { 
                count: products.length, 
                lastId,
                limit,
                filters 
            });

            return products;
        } catch (error: any) {
            logger.error('Error retrieving products (cursor)', { error: error.message, lastId, limit, filters });
            throw new Error(`Error al obtener productos (cursor): ${error.message}`);
        }
    }

    /**
     * 🔍 Obtiene un producto por ID
     * 
     * REGLA PLATINO: Manejo de errores específico
     * - Valida ObjectId antes de query
     * - Retorna null explícitamente si no existe
     * - Logging para debugging
     */
    async GetProductById(id: string): Promise<ProductDoc | null> {
        try {
            // ✅ Validar ObjectId antes de query
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn('Invalid product ID format', { id });
                throw new Error(`ID de producto inválido: ${id}`);
            }

            // @ts-ignore - Mongoose Query union types issue
            const product = await Products.findById(id).lean().exec();
            
            if (!product) {
                logger.debug('Product not found', { id });
                return null;  // ✅ Retornar null explícitamente
            }

            logger.debug('Product retrieved', { productId: id });
            return product as any as ProductDoc;
        } catch (error: any) {
            logger.error('Error retrieving product by ID', { error: error.message, id });
            throw new Error(`Error al obtener producto: ${error.message}`);
        }
    }

    /**
     * 🔄 Actualiza un producto existente
     * 
     * REGLA PLATINO: Operaciones atómicas y manejo de errores
     * - Usa findByIdAndUpdate para operación atómica
     * - Ejecuta validaciones de schema
     * - Retorna documento actualizado
     */
    async UpdateProduct(input: any): Promise<ProductDoc> {
        try {
            const { _id, ...updateData } = input;

            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                logger.warn('Invalid product ID format for update', { id: _id });
                throw new Error(`ID de producto inválido: ${_id}`);
            }

            // ✅ Usar findByIdAndUpdate para operación atómica
            // @ts-ignore - Mongoose Query union types issue
            const updatedProduct = await Products.findByIdAndUpdate(
                _id,
                { $set: updateData },
                { 
                    new: true,  // Retornar documento actualizado
                    runValidators: true,  // Ejecutar validaciones de schema
                    lean: true
                }
            ).exec();

            if (!updatedProduct) {
                logger.warn('Product not found for update', { id: _id });
                throw new Error(`Producto no encontrado: ${_id}`);
            }

            logger.info('Product updated', { productId: _id, updatedFields: Object.keys(updateData) });
            return updatedProduct as any as ProductDoc;
        } catch (error: any) {
            logger.error('Error updating product', { error: error.message, input });
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }

    /**
     * 🗑️ Elimina un producto
     * 
     * REGLA PLATINO: Manejo de errores y validaciones
     * - Valida ObjectId antes de eliminar
     * - Retorna información de la categoría para limpieza
     */
    async DeletProduct(id: string) {
        try {
            // ✅ Validar ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                logger.warn('Invalid product ID format for deletion', { id });
                throw new Error(`ID de producto inválido: ${id}`);
            }

            // Obtener información del producto antes de eliminar
            // @ts-ignore - Mongoose Query union types issue
            const product = await Products.findById(id).lean().exec();
            
            if (!product) {
                logger.warn('Product not found for deletion', { id });
                throw new Error(`Producto no encontrado: ${id}`);
            }

            const { category_id } = product as any;
            // @ts-ignore - Mongoose Query union types issue
            const resultDelet = await Products.findByIdAndDelete(id).exec();

            logger.info('Product deleted', { productId: id, categoryId: category_id });
            return { category_id, resultDelet };
        } catch (error: any) {
            logger.error('Error deleting product', { error: error.message, id });
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }
}