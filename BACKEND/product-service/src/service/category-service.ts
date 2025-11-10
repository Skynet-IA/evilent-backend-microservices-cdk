/**
 * 🏷️ Category Service - Lógica de negocio de categorías
 * 
 * Maneja toda la lógica de negocio relacionada con categorías.
 * Usa el helper centralizado request-parser para validación.
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #9: SIEMPRE mantener consistencia arquitectónica
 */

import { APIGatewayEvent } from "aws-lambda";
import { CategoryRepository } from "../repository/index.js";
import { CreatedResponse, ErrorResponse, SuccessResponse, ValidationErrorResponse } from "../utility/index.js";
import { 
    CreateCategorySchema, 
    UpdateCategorySchema, 
    GetCategoryByIdSchema,
    PaginationSchema 
} from "../dto/validation-schemas.js";
import { parseAndValidateBody, parseAndValidatePathParams, parseAndValidateQueryParams } from "../utility/request-parser.js";
import { createLogger } from "../utility/logger.js";

const logger = createLogger('CategoryService');

export class CategoryService {
    _repository: CategoryRepository;
    
    constructor(repository: CategoryRepository) {
        this._repository = repository;
    }

    async CreateCategory(event: APIGatewayEvent) {
        // ✅ Parse y valida en una sola línea
        const { data, error } = parseAndValidateBody(event, CreateCategorySchema);
        if (error) return ValidationErrorResponse(error.message, error.details);

        logger.info('Creando categoría', { name: data.name });

        const category = await this._repository.CreateCategory(data);

        return CreatedResponse(category, "Categoría creada exitosamente");
    }

    async GetCategories(event: APIGatewayEvent) {
        logger.info('Obteniendo categorías');

        const type = event.queryStringParameters?.type;

        if (type === 'top') {
            const categories = await this._repository.GetTopCategories();
            return SuccessResponse(categories, "Categorías top obtenidas exitosamente");
        } else {
            const categories = await this._repository.GetAllCategories();
            return SuccessResponse(categories, "Categorías obtenidas exitosamente");
        }
    }

    async GetCategory(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data: pathData, error: pathError } = parseAndValidatePathParams(
            event, 
            GetCategoryByIdSchema
        );
        if (pathError) return ValidationErrorResponse(pathError.message, pathError.details);

        // ✅ Validar query parameters (paginación)
        const { data: queryData, error: queryError } = parseAndValidateQueryParams(
            event, 
            PaginationSchema
        );
        if (queryError) return ValidationErrorResponse(queryError.message, queryError.details);

        logger.info('Obteniendo categoría por ID', { 
            categoryId: pathData.id, 
            pagination: queryData 
        });

        const category = await this._repository.GetCategoryById(
            pathData.id, 
            (queryData.page! - 1) * queryData.pageSize!, 
            queryData.pageSize
        );

        if (!category) {
            return ErrorResponse(404, 'Categoría no encontrada');
        }

        return SuccessResponse(category, "Categoría obtenida exitosamente");
    }

    async UpdateCategory(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data: pathData, error: pathError } = parseAndValidatePathParams(
            event, 
            GetCategoryByIdSchema
        );
        if (pathError) return ValidationErrorResponse(pathError.message, pathError.details);

        // ✅ Validar body
        const { data: bodyData, error: bodyError } = parseAndValidateBody(
            event, 
            UpdateCategorySchema
        );
        if (bodyError) return ValidationErrorResponse(bodyError.message, bodyError.details);

        // Combinar ID del path con datos del body
        const input = { ...bodyData, _id: pathData.id };
        
        logger.info('Actualizando categoría', { categoryId: pathData.id });

        const category = await this._repository.UpdateCategory(input);

        return SuccessResponse(category, "Categoría actualizada exitosamente");
    }

    async DeletCategory(event: APIGatewayEvent) {
        // ✅ Validar path parameters
        const { data, error } = parseAndValidatePathParams(event, GetCategoryByIdSchema);
        if (error) return ValidationErrorResponse(error.message, error.details);

        logger.info('Eliminando categoría', { categoryId: data.id });

        const deleted = await this._repository.DeletCategory(data.id);

        // ✅ Verificar si la categoría existe
        if (!deleted) {
            return ErrorResponse(404, 'Categoría no encontrada para eliminar');
        }

        return SuccessResponse({ deleted: true }, "Categoría eliminada exitosamente");
    }
}
