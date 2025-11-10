# ============================================
# Makefile - Product Service (AWS CDK)
# ============================================
# Comandos esenciales para gestionar el stack en AWS
#
# Uso básico:
#   make deploy COGNITO_POOL_ID=eu-central-1_abc123  # Desplegar stack
#   make logs                                          # Ver logs
#   make destroy                                       # Eliminar stack
#
# Variables importantes:
#   COGNITO_POOL_ID: ID del User Pool de Cognito (REQUERIDO para deploy)
#   COGNITO_APP_CLIENT_ID: ID del App Client de Cognito (REQUERIDO para deploy)
#   MongoDB: Configurado automáticamente via AWS Secrets Manager (NO requiere configuración manual)
#   AWS_REGION: Región de AWS (default: eu-central-1)
# ============================================

.PHONY: help install deploy build prepare-lambda update logs logs-follow status outputs destroy clean diff synth test test-all test-unit test-integration test-validation test-helpers test-watch test-coverage test-info validate api-url check-aws list-stacks configure-mongodb mongodb-status

# ============================================
# VARIABLES
# ============================================
AWS_REGION = eu-central-1
STACK_NAME = ProductServiceStack
COGNITO_POOL_ID ?=
COGNITO_APP_CLIENT_ID ?=
MONGODB_URI ?=
MONGODB_SECRET_NAME = prod/product-service/mongodb

# Colores
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
BLUE = \033[0;34m
NC = \033[0m

# ============================================
# AYUDA (comando por defecto)
# ============================================
help: ## Muestra esta ayuda
	@echo "$(GREEN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║         PRODUCT SERVICE - COMANDOS DISPONIBLES            ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  🚀 SETUP INICIAL (ejecutar en orden, una sola vez)      ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  0️⃣  cd ../iam-policies && make deploy  # Políticas IAM (PRIMERO)"
	@echo "  1️⃣  make install                        # Instalar dependencias"
	@echo "  2️⃣  make deploy COGNITO_POOL_ID=xxx COGNITO_APP_CLIENT_ID=yyy MONGODB_URI='mongodb://user:pass@host:27017/db'"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  📊 USO DIARIO                                            ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make update COGNITO_POOL_ID=xxx COGNITO_APP_CLIENT_ID=yyy MONGODB_URI='...'  # Actualizar código"
	@echo "  make configure-mongodb MONGODB_URI='mongodb://...'  # Actualizar solo el secret de MongoDB"
	@echo "  make mongodb-status              # Ver estado del secret de MongoDB"
	@echo "  make logs                        # Ver logs de Lambda"
	@echo "  make logs-follow                 # Seguir logs en tiempo real"
	@echo "  make status                      # Ver estado del stack"
	@echo "  make outputs                     # Ver API URL y outputs"
	@echo "  make api-url                     # Obtener solo la URL del API"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🗑️  LIMPIEZA                                             ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make destroy                     # Eliminar stack (políticas IAM se mantienen)"
	@echo "  make clean                       # Limpiar archivos compilados"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🛠️  UTILIDADES (avanzado)                                ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make build                       # Compilar TypeScript"
	@echo "  make diff                        # Ver diferencias antes de deployar"
	@echo "  make synth                       # Sintetizar CloudFormation template"
	@echo "  make validate                    # Validar configuración (build + synth)"
	@echo "  make check-aws                   # Verificar configuración de AWS CLI"
	@echo "  make list-stacks                 # Listar todos los stacks"
	@echo ""
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🧪 TESTING                                                ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make test-info                   # 📖 Ver explicación de cada tipo de test"
	@echo "  make test                        # 🧪 Ejecutar todos los tests"
	@echo "  make test-validation             # ✅ Tests de validación Zod (100% funcionando)"
	@echo "  make test-unit                   # 🔬 Tests unitarios de services"
	@echo "  make test-integration            # 🌐 Tests de integración de APIs"
	@echo "  make test-helpers                # 🛠️  Tests de funciones helper"
	@echo "  make test-watch                  # 👀 Ejecutar tests en modo watch"
	@echo "  make test-coverage               # 📊 Tests con reporte de coverage"
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  AWS_REGION = $(AWS_REGION)"
	@echo "  COGNITO_POOL_ID = $(COGNITO_POOL_ID)"
	@echo "  COGNITO_APP_CLIENT_ID = $(COGNITO_APP_CLIENT_ID)"
	@echo "  MONGODB_URI = $(MONGODB_URI)"
	@echo "  MONGODB_SECRET_NAME = $(MONGODB_SECRET_NAME)"
	@echo "  STACK_NAME = $(STACK_NAME)"
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"

# ============================================
# FUNCIÓN AUXILIAR: Gestionar MongoDB Secret
# ============================================

define update_mongodb_secret
	@if [ -z "$(1)" ]; then \
		echo "$(RED)❌ ERROR: MONGODB_URI no configurada$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🔐 Actualizando MongoDB Secret en AWS Secrets Manager...$(NC)"
	@aws secretsmanager put-secret-value \
		--secret-id $(MONGODB_SECRET_NAME) \
		--secret-string "{\"MONGODB_URI\":\"$(1)\"}" \
		--region $(AWS_REGION) 2>/dev/null && \
		echo "$(GREEN)✅ Secret actualizado exitosamente$(NC)" || \
	(aws secretsmanager create-secret \
		--name $(MONGODB_SECRET_NAME) \
		--description "MongoDB URI para Product Service" \
		--secret-string "{\"MONGODB_URI\":\"$(1)\"}" \
		--region $(AWS_REGION) && \
		echo "$(GREEN)✅ Secret creado exitosamente$(NC)")
endef

# ============================================
# 1️⃣ SETUP INICIAL (ejecutar en orden)
# ============================================

install: ## [PASO 1] Instalar dependencias npm
	@echo "$(GREEN)📦 [1/2] Instalando dependencias...$(NC)"
	npm install
	@echo "$(GREEN)✅ Instalación completada$(NC)"
	@echo "$(YELLOW)💡 IMPORTANTE: Primero despliega políticas IAM$(NC)"
	@echo "$(YELLOW)   cd ../iam-policies && make deploy$(NC)"
	@echo "$(YELLOW)💡 Siguiente: make deploy COGNITO_POOL_ID=tu_pool_id COGNITO_APP_CLIENT_ID=tu_client_id MONGODB_URI=tu_uri$(NC)"

deploy: build ## [PASO 2] Desplegar servicio completo
	@echo "$(GREEN)🚀 [2/2] Desplegando servicio completo...$(NC)"
	@if [ -z "$(COGNITO_POOL_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_APP_CLIENT_ID$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(MONGODB_URI)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar MONGODB_URI$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📋 Configuración:$(NC)"
	@echo "  Stack: $(STACK_NAME)"
	@echo "  Cognito Pool: $(COGNITO_POOL_ID)"
	@echo "  Cognito Client: $(COGNITO_APP_CLIENT_ID)"
	@echo "  MongoDB URI: ✅ Configurada"
	@echo "  Región: $(AWS_REGION)"
	@echo "  Componentes:"
	@echo "    • 4 Lambda Functions (products, categories, deals, images)"
	@echo "    • API Gateway REST API"
	@echo "    • S3 Bucket para imágenes"
	@echo "    • AWS Secrets Manager para MongoDB"
	@echo "    • CloudWatch Logs"
	@echo ""
	@echo "$(BLUE)[1/2] Configurando MongoDB Secret...$(NC)"
	$(call update_mongodb_secret,$(MONGODB_URI))
	@echo ""
	@echo "$(BLUE)[2/2] Desplegando CDK Stack...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk deploy $(STACK_NAME) \
		--parameters CognitoPoolId=$(COGNITO_POOL_ID) \
		--parameters CognitoAppClientId=$(COGNITO_APP_CLIENT_ID) \
		--require-approval never
	@echo ""
	@echo "$(GREEN)✅ Deploy completado al 100%$(NC)"
	@echo "$(YELLOW)💡 Obtén la URL del API: make api-url$(NC)"

# ============================================
# 2️⃣ DESARROLLO Y ACTUALIZACIONES
# ============================================

build: ## Compilar TypeScript a JavaScript
	@echo "$(GREEN)🔨 Compilando TypeScript...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Compilación exitosa$(NC)"

prepare-lambda: build ## Preparar deployment package de Lambda desde dist/
	@echo "$(GREEN)📦 Preparando deployment package de Lambda...$(NC)"
	@echo "$(YELLOW)   └─ Creando directorio lambda-deploy/...$(NC)"
	@mkdir -p lambda-deploy
	@echo "$(YELLOW)   └─ Limpiando lambda-deploy/...$(NC)"
	@rm -rf lambda-deploy/*
	@echo "$(YELLOW)   └─ Copiando dist/ → lambda-deploy/...$(NC)"
	@cp -r dist/* lambda-deploy/
	@echo "$(YELLOW)   └─ Copiando package.json...$(NC)"
	@cp package.json lambda-deploy/
	@echo "$(YELLOW)   └─ Instalando dependencias de producción...$(NC)"
	@cd lambda-deploy && npm install --production --silent
	@echo "$(GREEN)✅ Deployment package listo en lambda-deploy/$(NC)"

update: build ## Actualizar servicio después de cambios (build + deploy rápido)
	@echo "$(GREEN)🔄 Actualizando servicio...$(NC)"
	@if [ -z "$(COGNITO_POOL_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_APP_CLIENT_ID$(NC)"; \
		exit 1; \
	fi
	@if [ -n "$(MONGODB_URI)" ]; then \
		echo "$(BLUE)[1/2] Actualizando MongoDB Secret...$(NC)"; \
		$(call update_mongodb_secret,$(MONGODB_URI)); \
		echo ""; \
	fi
	@echo "$(BLUE)[2/2] Actualizando CDK Stack...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk deploy $(STACK_NAME) \
		--parameters CognitoPoolId=$(COGNITO_POOL_ID) \
		--parameters CognitoAppClientId=$(COGNITO_APP_CLIENT_ID) \
		--require-approval never
	@echo "$(GREEN)✅ Servicio actualizado$(NC)"

diff: build ## Ver diferencias con el stack desplegado
	@echo "$(GREEN)🔍 Comparando cambios...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk diff $(STACK_NAME)

synth: build ## Sintetizar CloudFormation template
	@echo "$(GREEN)📋 Sintetizando template...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk synth $(STACK_NAME)

validate: build synth ## Validar configuración (build + synth)
	@echo "$(GREEN)✅ Validación exitosa$(NC)"

# ============================================
# 3️⃣ MONITOREO Y LOGS
# ============================================

logs: ## Ver logs de Lambda (últimos 10 minutos)
	@echo "$(GREEN)📜 Logs de Lambda (últimos 10 minutos):$(NC)"
	@FUNCTION_NAME=$$(aws cloudformation describe-stack-resources \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" \
		--output text 2>/dev/null | head -1); \
	if [ -n "$$FUNCTION_NAME" ]; then \
		LOG_GROUP="/aws/lambda/$$FUNCTION_NAME"; \
		echo "$(YELLOW)📋 Function: $$FUNCTION_NAME$(NC)"; \
		aws logs tail $$LOG_GROUP --since 10m --region $(AWS_REGION); \
	else \
		echo "$(YELLOW)No se encontró función Lambda desplegada$(NC)"; \
	fi

logs-follow: ## Seguir logs en tiempo real
	@echo "$(GREEN)📜 Siguiendo logs en tiempo real (Ctrl+C para salir):$(NC)"
	@FUNCTION_NAME=$$(aws cloudformation describe-stack-resources \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" \
		--output text 2>/dev/null | head -1); \
	if [ -n "$$FUNCTION_NAME" ]; then \
		LOG_GROUP="/aws/lambda/$$FUNCTION_NAME"; \
		echo "$(YELLOW)📋 Function: $$FUNCTION_NAME$(NC)"; \
		aws logs tail $$LOG_GROUP --follow --region $(AWS_REGION); \
	else \
		echo "$(YELLOW)No se encontró función Lambda desplegada$(NC)"; \
	fi

status: ## Ver estado del stack
	@echo "$(GREEN)📊 Estado del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--query 'Stacks[0].[StackName, StackStatus, CreationTime]' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

outputs: ## Ver outputs del stack (API URL, etc.)
	@echo "$(GREEN)📤 Outputs del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

api-url: ## Obtener URL del API Gateway
	@echo "$(GREEN)🌐 URL del API Gateway:$(NC)"
	@API_URL=$$(aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `ApiGateway`) || contains(OutputKey, `Endpoint`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$API_URL" ]; then \
		echo "$(YELLOW)$$API_URL$(NC)"; \
	else \
		echo "$(YELLOW)Stack no encontrado o no tiene API Gateway desplegado$(NC)"; \
	fi

# ============================================
# 4️⃣ LIMPIEZA Y DESTRUCCIÓN
# ============================================

destroy: ## Eliminar el servicio (políticas IAM se mantienen en ../iam-policies/)
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  ⚠️  ADVERTENCIA: Esto eliminará el servicio             ║$(NC)"
	@echo "$(RED)║  ℹ️  Las políticas IAM se mantienen (gestionadas aparte) ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Proceso de eliminación:$(NC)"
	@echo "  1. Eliminar $(STACK_NAME)"
	@echo "  2. (Políticas IAM se mantienen en IamPoliciesStack)"
	@echo ""
	@echo "$(YELLOW)Recursos que se eliminarán:$(NC)"
	@echo "  • Lambda functions (5 funciones)"
	@echo "  • API Gateway"
	@echo "  • S3 Bucket (imágenes)"
	@echo "  • CloudWatch Logs"
	@echo "  • IAM Roles (creados por el stack)"
	@echo ""
	@echo "$(GREEN)Recursos que se MANTIENEN:$(NC)"
	@echo "  • ✅ IamPoliciesStack (gestionado en ../iam-policies/)"
	@echo "  • ✅ Políticas IAM"
	@echo "  • ✅ Permisos de usuario"
	@echo ""
	@echo "$(YELLOW)⏱️  Tiempo estimado: 2-5 minutos$(NC)"
	@echo ""
	@echo "$(RED)Presiona Ctrl+C para CANCELAR o Enter para CONTINUAR...$(NC)"
	@read confirm
	@echo ""
	@echo "$(YELLOW)🗑️  Eliminando $(STACK_NAME)...$(NC)"
	@CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk destroy $(STACK_NAME) --force
	@echo ""
	@echo "$(GREEN)✅ $(STACK_NAME) eliminado$(NC)"
	@echo "$(GREEN)✅ Políticas IAM mantenidas (gestionadas en ../iam-policies/)$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Para eliminar políticas IAM:$(NC)"
	@echo "$(YELLOW)   cd ../iam-policies && make destroy$(NC)"

clean: ## Limpiar archivos compilados y node_modules
	@echo "$(YELLOW)🧹 Limpiando archivos...$(NC)"
	rm -rf node_modules
	rm -rf cdk.out
	rm -rf dist
	rm -rf *.d.ts
	rm -rf *.js
	rm -rf lib/*.d.ts
	rm -rf lib/*.js
	rm -rf src/**/*.d.ts
	rm -rf src/**/*.js
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# ============================================
# 5️⃣ UTILIDADES
# ============================================

check-aws: ## Verificar configuración de AWS CLI
	@echo "$(GREEN)🔍 Verificando AWS CLI...$(NC)"
	@aws sts get-caller-identity --region $(AWS_REGION) --query '[Account,Arn]' --output table
	@echo "$(GREEN)✅ AWS CLI configurado correctamente$(NC)"

list-stacks: ## Listar todos los stacks de CloudFormation
	@echo "$(GREEN)📚 Stacks de CloudFormation:$(NC)"
	@aws cloudformation list-stacks \
		--region $(AWS_REGION) \
		--stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
		--query 'StackSummaries[*].[StackName,StackStatus,CreationTime]' \
		--output table

# ============================================
# 6️⃣ TESTING
# ============================================

test-info: ## 📖 Mostrar información detallada sobre los tests disponibles
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  📖 GUÍA DE TESTING - PRODUCT SERVICE                     ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)📊 TIPOS DE TESTS DISPONIBLES$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)1. ✅ TESTS DE VALIDACIÓN ZOD$(NC) (make test-validation)"
	@echo "   • Qué prueba: Schemas de validación con Zod"
	@echo "   • Archivos: test/unit/validation-schemas.test.ts"
	@echo "   • Tests: 42 tests"
	@echo "   • Estado: ✅ 100% funcionando"
	@echo "   • Dependencias: Ninguna"
	@echo "   • Tiempo: ~0.2 segundos"
	@echo ""
	@echo "$(YELLOW)2. 🔬 TESTS UNITARIOS$(NC) (make test-unit)"
	@echo "   • Qué prueba: Services con mocks de repositorios"
	@echo "   • Archivos: test/unit/product-service.test.ts"
	@echo "   •           test/unit/category-service.test.ts"
	@echo "   • Tests: 40 tests"
	@echo "   • Dependencias: Mocks (sin AWS, sin DB)"
	@echo "   • Tiempo: ~1-2 segundos"
	@echo ""
	@echo "$(YELLOW)3. 🛠️  TESTS DE HELPERS$(NC) (make test-helpers)"
	@echo "   • Qué prueba: Funciones helper de validación"
	@echo "   • Archivos: test/helpers/zod-validator.test.ts"
	@echo "   • Tests: 22 tests"
	@echo "   • Dependencias: Ninguna"
	@echo "   • Tiempo: ~0.5 segundos"
	@echo ""
	@echo "$(YELLOW)4. 🌐 TESTS DE INTEGRACIÓN$(NC) (make test-integration)"
	@echo "   • Qué prueba: Handlers de API con mocks de AWS"
	@echo "   • Archivos: test/integration/product-api.test.ts"
	@echo "   • Tests: 14 tests"
	@echo "   • Dependencias: Mocks de Cognito y S3"
	@echo "   • Tiempo: ~1-2 segundos"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)📈 ESTADÍSTICAS$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "  Total de tests implementados: 118"
	@echo "  Tests verificados funcionando: 42 (100%)"
	@echo "  Cobertura esperada: ~75%"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(GREEN)🚀 COMANDOS RÁPIDOS$(NC)"
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "  $(YELLOW)make test-validation$(NC)     # ✅ Recomendado: Tests de Zod (100% funcionando)"
	@echo "  $(YELLOW)make test-watch$(NC)          # 👀 Modo watch para desarrollo"
	@echo "  $(YELLOW)make test-coverage$(NC)       # 📊 Ver cobertura de código"
	@echo ""
	@echo "$(GREEN)═══════════════════════════════════════════════════════════════$(NC)"

test: ## 🧪 Ejecutar todos los tests
	@echo "$(GREEN)🧪 Ejecutando todos los tests...$(NC)"
	@echo "$(YELLOW)⚠️  Nota: Algunos tests pueden fallar debido a ES modules$(NC)"
	npm test
	@echo "$(GREEN)✅ Tests completados$(NC)"

test-validation: ## ✅ Ejecutar tests de validación Zod (100% funcionando)
	@echo "$(GREEN)✅ Ejecutando tests de validación Zod...$(NC)"
	@echo "$(YELLOW)📋 Tests: 42 tests de schemas de validación$(NC)"
	npm run test:validation
	@echo "$(GREEN)✅ Tests de validación completados$(NC)"

test-unit: ## 🔬 Ejecutar tests unitarios de services
	@echo "$(GREEN)🔬 Ejecutando tests unitarios...$(NC)"
	@echo "$(YELLOW)📋 Tests: ProductService, CategoryService$(NC)"
	npm run test:unit
	@echo "$(GREEN)✅ Tests unitarios completados$(NC)"

test-integration: ## 🌐 Ejecutar tests de integración de APIs
	@echo "$(GREEN)🌐 Ejecutando tests de integración...$(NC)"
	@echo "$(YELLOW)📋 Tests: product-api.ts con mocks de AWS$(NC)"
	npm run test:integration
	@echo "$(GREEN)✅ Tests de integración completados$(NC)"

test-helpers: ## 🛠️  Ejecutar tests de funciones helper
	@echo "$(GREEN)🛠️  Ejecutando tests de helpers...$(NC)"
	@echo "$(YELLOW)📋 Tests: zod-validator.ts$(NC)"
	npm test -- test/helpers
	@echo "$(GREEN)✅ Tests de helpers completados$(NC)"

test-watch: ## 👀 Ejecutar tests en modo watch (útil para desarrollo)
	@echo "$(GREEN)👀 Iniciando tests en modo watch...$(NC)"
	@echo "$(YELLOW)💡 Presiona 'q' para salir$(NC)"
	npm run test:watch

test-coverage: ## 📊 Ejecutar tests con reporte de coverage
	@echo "$(GREEN)📊 Ejecutando tests con coverage...$(NC)"
	npm run test:coverage
	@echo "$(GREEN)✅ Reporte de coverage generado en coverage/$(NC)"
	@echo "$(YELLOW)💡 Abre coverage/lcov-report/index.html para ver el reporte$(NC)"

test-all: test-validation test-unit test-integration test-helpers ## 🚀 Ejecutar todos los tipos de tests secuencialmente
	@echo "$(GREEN)🎉 Todos los tests completados$(NC)"

# ============================================
# 6️⃣ GESTIÓN DE MONGODB
# ============================================

configure-mongodb: ## Configurar o actualizar MongoDB Secret sin desplegar
	@if [ -z "$(MONGODB_URI)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar MONGODB_URI$(NC)"; \
		echo "$(YELLOW)Uso: make configure-mongodb MONGODB_URI='mongodb://...'$(NC)"; \
		exit 1; \
	fi
	$(call update_mongodb_secret,$(MONGODB_URI))
	@echo ""
	@echo "$(GREEN)✅ Para aplicar cambios en Lambda, ejecuta: make update$(NC)"

mongodb-status: ## Ver estado del MongoDB Secret en AWS Secrets Manager
	@echo "$(BLUE)🔐 Estado del MongoDB Secret:$(NC)"
	@echo ""
	@aws secretsmanager get-secret-value \
		--secret-id $(MONGODB_SECRET_NAME) \
		--region $(AWS_REGION) \
		--query 'SecretString' \
		--output text 2>/dev/null | jq . || \
	echo "$(YELLOW)⚠️  Secret no encontrado. Ejecuta: make configure-mongodb MONGODB_URI='...'$(NC)"

# ============================================
# TARGET POR DEFECTO
# ============================================

.DEFAULT_GOAL := help
