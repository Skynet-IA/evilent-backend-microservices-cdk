/**
 * 📦 Product Service - Lógica de negocio de productos
 * 
 * Maneja toda la lógica de negocio relacionada con productos.
 * Usa el helper centralizado request-parser para validación.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

import { APIGatewayEvent } from "aws-lambda";
import { CategoryRepository, ProductRepository } from "../repository/index.js";
import { CreatedResponse, ErrorResponse, SuccessResponse, ValidationErrorResponse } from "../utility/index.js";
import { 
    CreateProductSchema, 
    UpdateProductSchema, 
    GetProductByIdSchema 
} from "../dto/validation-schemas.js";
import { parseAndValidateBody, parseAndValidatePathParams } from "../utility/request-parser.js";
import { createLogger } from "../utility/logger.js";

const logger = createLogger('ProductService');

export class ProductService {
    _repository: ProductRepository;
    _categoryRepository: CategoryRepository;

    constructor(repository: ProductRepository, categoryRepository?: CategoryRepository) {
        this._repository = repository;
        this._categoryRepository = categoryRepository || new CategoryRepository();
    }

    async CreateProduct(event: APIGatewayEvent) {
        // ✅ Parse y valida en una sola línea
        const { data, error } = parseAndValidateBody(event, CreateProductSchema);
        if (error) return ValidationErrorResponse(error.message, error.details);

        // Data está garantizado como válido después de la validación
        const validatedData = data!;

        logger.info('Creando producto', { name: validatedData.name, price: validatedData.price });

        const product = await this._repository.CreateProduct(validatedData);

        // Agregar producto a la categoría si se proporcionó categoryId
        if (validatedData.categoryId) {
            await this._categoryRepository.addItem({
                id: validatedData.categoryId,
                products: [product._id]
            });
        }

        return CreatedResponse(product, "Producto creado exitosamente");
    }

    async GetProducts(event: APIGatewayEvent) {
        logger.info('Obteniendo todos los productos');

        const products = await this._repository.GetAllProducts();

        return SuccessResponse(products, "Productos obtenidos exitosamente");
    }

    async GetProduct(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data, error } = parseAndValidatePathParams(event, GetProductByIdSchema);
        if (error) return ValidationErrorResponse(error.message, error.details);

        logger.info('Obteniendo producto por ID', { productId: data.id });

        const product = await this._repository.GetProductById(data.id);

        if (!product) {
            return ErrorResponse(404, 'Producto no encontrado');
        }

        return SuccessResponse(product, "Producto obtenido exitosamente");
    }

    async UpdateProduct(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data: pathData, error: pathError } = parseAndValidatePathParams(
            event, 
            GetProductByIdSchema
        );
        if (pathError) return ValidationErrorResponse(pathError.message, pathError.details);

        // ✅ Validar body
        const { data: bodyData, error: bodyError } = parseAndValidateBody(
            event,
            UpdateProductSchema
        );
        if (bodyError) return ValidationErrorResponse(bodyError.message, bodyError.details);

        // Combinar ID del path con datos del body
        const input = { ...bodyData, _id: pathData.id };
        
        logger.info('Actualizando producto', { productId: pathData.id });

        const product = await this._repository.UpdateProduct(input);

        return SuccessResponse(product, "Producto actualizado exitosamente");
    }

    async DeletProduct(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data, error } = parseAndValidatePathParams(event, GetProductByIdSchema);
        if (error) return ValidationErrorResponse(error.message, error.details);

        logger.info('Eliminando producto', { productId: data.id });

        const result = await this._repository.DeletProduct(data.id);

        // ✅ Verificar si el producto existe
        if (!result) {
            return ErrorResponse(404, 'Producto no encontrado para eliminar');
        }

        const { category_id, resultDelet } = result;

        // Remover producto de la categoría si tenía una
        if (category_id) {
            await new CategoryRepository().removeItem({ 
                id: category_id, 
                products: [data.id] 
            });
        }

        return SuccessResponse({ deleted: true }, "Producto eliminado exitosamente");
    }
}
