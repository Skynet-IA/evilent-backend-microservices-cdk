# ============================================
# Makefile - User Service (AWS CDK)
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
#   AWS_REGION: Región de AWS (default: eu-central-1)
# ============================================

.PHONY: help install deploy-policies bastion-policy-apply deploy build prepare-lambda update logs logs-follow status outputs bastion-status bastion-stop bastion-start bastion-connect bastion-psql bastion-migrate destroy-service destroy clean diff synth test-all test-unit test-integration test-database test-database-proxy setup-db-env test-info

# ============================================
# VARIABLES
# ============================================
AWS_REGION = eu-central-1
# COGNITO_POOL_ID = [REDACTED - Configure via environment variable]

# Colores
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m

# ============================================
# AYUDA (comando por defecto)
# ============================================
help: ## Muestra esta ayuda
	@echo "$(GREEN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║         USER SERVICE - COMANDOS DISPONIBLES               ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  🚀 SETUP INICIAL (ejecutar en orden, una sola vez)      ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  0️⃣  cd ../iam-policies && make deploy  # Políticas IAM (PRIMERO)"
	@echo "  1️⃣  make install                        # Instalar dependencias"
	@echo "  2️⃣  make bastion-policy-apply           # Aplicar permisos al usuario"
	@echo "  3️⃣  make deploy COGNITO_POOL_ID=xxx     # Desplegar servicio"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  📊 USO DIARIO                                            ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make update COGNITO_POOL_ID=xxx  # Actualizar código del servicio"
	@echo "  make logs                        # Ver logs de Lambda"
	@echo "  make logs-follow                 # Seguir logs en tiempo real"
	@echo "  make status                      # Ver estado del stack"
	@echo "  make outputs                     # Ver API URL, DB endpoint, etc"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🖥️  GESTIÓN DE BASTION (ahorro de costos)               ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make bastion-status              # Ver estado del Bastion"
	@echo "  make bastion-stop                # Detener (ahorra ~$6/mes)"
	@echo "  make bastion-start               # Iniciar cuando lo necesites"
	@echo "  make bastion-connect             # Conectar via SSM"
	@echo "  make bastion-psql                # Acceso directo a PostgreSQL"
	@echo "  make bastion-migrate             # Ejecutar migraciones de DB"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🗑️  LIMPIEZA                                             ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make destroy-service             # Solo servicio (mantiene políticas $$0)"
	@echo "  make destroy                     # TODO incluyendo políticas"
	@echo "  make clean                       # Limpiar archivos compilados"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🛠️  UTILIDADES (avanzado)                                ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make build                       # Compilar TypeScript"
	@echo "  make prepare-lambda              # Preparar deployment package"
	@echo "  make diff                        # Ver diferencias antes de deployar"
	@echo "  make synth                       # Sintetizar CloudFormation template"
	@echo ""
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🧪 TESTING                                                ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make test-info                   # 📖 Ver explicación de cada tipo de test"
	@echo "  make test-unit                   # 🧪 Unitarios (sin dependencias)"
	@echo "  make test-integration            # 🌐 HTTP (requiere API desplegada)"
	@echo "  make test-database-proxy         # 🗄️  PostgreSQL AUTOMÁTICO (recomendado)"
	@echo "  make test-database               # 🗄️  PostgreSQL manual (requiere túnel)"
	@echo "  make test-all                    # 🚀 TODOS los tests"
	@echo "  make setup-db-env                # 🔧 Configurar entorno para DB tests"
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  AWS_REGION = $(AWS_REGION)"
	@echo "  COGNITO_POOL_ID = $(COGNITO_POOL_ID)"
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"

# ============================================
# 1️⃣ SETUP INICIAL (ejecutar en orden)
# ============================================

install: ## [PASO 1] Instalar dependencias npm
	@echo "$(GREEN)📦 [1/3] Instalando dependencias...$(NC)"
	npm install
	@echo "$(GREEN)✅ Instalación completada$(NC)"
	@echo "$(YELLOW)💡 IMPORTANTE: Primero despliega políticas IAM$(NC)"
	@echo "$(YELLOW)   cd ../iam-policies && make deploy$(NC)"
	@echo "$(YELLOW)💡 Siguiente: make bastion-policy-apply$(NC)"

bastion-policy-apply: ## [PASO 2] Aplicar permisos IAM al usuario desarrollador
	@echo "$(GREEN)🔐 [2/3] Aplicando permisos al usuario...$(NC)"
	@echo "$(YELLOW)📋 Usuario: skynet-developer$(NC)"
	@echo "$(YELLOW)⚠️  NOTA: Políticas IAM ahora se gestionan en ../iam-policies/$(NC)"
	@echo ""
	@POLICY_ARN=$$(aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?OutputKey==`UserServicePolicyArn`].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$POLICY_ARN" ] && [ "$$POLICY_ARN" != "None" ]; then \
		echo "$(YELLOW)🔗 ARN: $$POLICY_ARN$(NC)"; \
		aws iam attach-user-policy \
			--user-name skynet-developer \
			--policy-arn "$$POLICY_ARN" \
			--region $(AWS_REGION); \
		echo "$(GREEN)✅ Permisos aplicados$(NC)"; \
		echo ""; \
		echo "$(YELLOW)💡 Siguiente: make deploy COGNITO_POOL_ID=tu_pool_id$(NC)"; \
	else \
		echo "$(RED)❌ No se encontró IamPoliciesStack$(NC)"; \
		echo "$(YELLOW)💡 Ejecuta: cd ../iam-policies && make deploy$(NC)"; \
		exit 1; \
	fi

deploy: prepare-lambda ## [PASO 3] Desplegar servicio completo CON base de datos
	@echo "$(GREEN)🚀 [3/3] Desplegando servicio completo...$(NC)"
	@if [ -z "$(COGNITO_POOL_ID)" ] || [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID$(NC)"; \
		echo "$(YELLOW)Uso: make deploy COGNITO_POOL_ID=eu-central-1_abc123 COGNITO_APP_CLIENT_ID=xyz123$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📋 Configuración:$(NC)"
	@echo "  Stack: UserServiceStack"
	@echo "  Cognito Pool: $(COGNITO_POOL_ID)"
	@echo "  Cognito App Client: $(COGNITO_APP_CLIENT_ID)"
	@echo "  Región: $(AWS_REGION)"
	@echo "  Base de datos: ✅ Activada (Single-AZ, t4g.micro)"
	@echo ""
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk deploy UserServiceStack \
		-c cognitoPoolId=$(COGNITO_POOL_ID) \
		-c cognitoAppClientId=$(COGNITO_APP_CLIENT_ID) \
		-c withDatabase=true \
		-c multiAz=false \
		--require-approval never
	@echo ""
	@echo "$(GREEN)✅ ¡Setup completo! Servicio desplegado$(NC)"
	@echo "$(YELLOW)💡 Ver API URL: make outputs$(NC)"
	@echo "$(YELLOW)💡 Ver logs: make logs$(NC)"
	@echo "$(YELLOW)💡 Detener Bastion para ahorrar: make bastion-stop$(NC)"

# ============================================
# 2️⃣ USO DIARIO
# ============================================

build: ## Compilar TypeScript (se ejecuta automáticamente en deploy/update)
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
	@if [ -f index.js ]; then \
		echo "$(YELLOW)   └─ Copiando entry point index.js...$(NC)"; \
		cp index.js lambda-deploy/; \
	fi
	@echo "$(YELLOW)   └─ Copiando package.json...$(NC)"
	@cp package.json lambda-deploy/
	@echo "$(YELLOW)   └─ Instalando dependencias de producción...$(NC)"
	@cd lambda-deploy && npm install --production --silent
	@echo "$(GREEN)✅ Deployment package listo en lambda-deploy/$(NC)"

update: prepare-lambda ## Actualizar código del servicio (más rápido que deploy)
	@echo "$(GREEN)🔄 Actualizando servicio...$(NC)"
	@if [ -z "$(COGNITO_POOL_ID)" ] || [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID$(NC)"; \
		echo "$(YELLOW)Uso: make update COGNITO_POOL_ID=eu-central-1_abc123 COGNITO_APP_CLIENT_ID=xyz123$(NC)"; \
		exit 1; \
	fi
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk deploy UserServiceStack \
		-c cognitoPoolId=$(COGNITO_POOL_ID) \
		-c cognitoAppClientId=$(COGNITO_APP_CLIENT_ID) \
		-c withDatabase=true \
		-c multiAz=false \
		--require-approval never
	@echo "$(GREEN)✅ Actualización completada$(NC)"

logs: ## Ver logs de Lambda (últimos 30 minutos)
	@echo "$(GREEN)📜 Logs de Lambda (últimos 30 min):$(NC)"
	@FUNCTION_NAME=$$(aws cloudformation describe-stack-resources \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query "StackResources[?ResourceType=='AWS::Lambda::Function' && contains(LogicalResourceId, 'UserService')].PhysicalResourceId" \
		--output text 2>/dev/null | head -1); \
	if [ -n "$$FUNCTION_NAME" ]; then \
		LOG_GROUP="/aws/lambda/$$FUNCTION_NAME"; \
		echo "$(YELLOW)📋 Log Group: $$LOG_GROUP$(NC)"; \
		echo ""; \
		aws logs tail "$$LOG_GROUP" --since 30m --region $(AWS_REGION) 2>&1 || echo "$(YELLOW)No hay logs recientes$(NC)"; \
		echo ""; \
		echo "$(YELLOW)💡 Para seguir en tiempo real: make logs-follow$(NC)"; \
	else \
		echo "$(RED)❌ No se encontró función Lambda$(NC)"; \
		echo "$(YELLOW)💡 Verifica que el stack esté desplegado: make status$(NC)"; \
	fi

logs-follow: ## Seguir logs en tiempo real (Ctrl+C para salir)
	@echo "$(GREEN)📜 Siguiendo logs en tiempo real...$(NC)"
	@echo "$(YELLOW)💡 Presiona Ctrl+C para salir$(NC)"
	@echo ""
	@FUNCTION_NAME=$$(aws cloudformation describe-stack-resources \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query "StackResources[?ResourceType=='AWS::Lambda::Function' && contains(LogicalResourceId, 'UserService')].PhysicalResourceId" \
		--output text 2>/dev/null | head -1); \
	if [ -n "$$FUNCTION_NAME" ]; then \
		LOG_GROUP="/aws/lambda/$$FUNCTION_NAME"; \
		aws logs tail "$$LOG_GROUP" --follow --region $(AWS_REGION); \
	else \
		echo "$(RED)❌ No se encontró función Lambda$(NC)"; \
	fi

status: ## Ver estado del stack
	@echo "$(GREEN)📊 Estado del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].[StackName, StackStatus, CreationTime]' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

outputs: ## Ver outputs del stack (API URL, DB endpoint, etc)
	@echo "$(GREEN)📤 Outputs del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

# ============================================
# 3️⃣ GESTIÓN DE BASTION (ahorro de costos)
# ============================================

bastion-status: ## Ver estado del Bastion Host
	@echo "$(GREEN)📊 Estado del Bastion Host:$(NC)"
	@INSTANCE_ID=$$(aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$INSTANCE_ID" ] && [ "$$INSTANCE_ID" != "None" ]; then \
		echo "$(YELLOW)✅ Instance ID: $$INSTANCE_ID$(NC)"; \
		STATE=$$(aws ec2 describe-instances \
			--instance-ids "$$INSTANCE_ID" \
			--region $(AWS_REGION) \
			--query 'Reservations[0].Instances[0].State.Name' \
			--output text 2>/dev/null); \
		if [ "$$STATE" = "running" ]; then \
			echo "$(GREEN)Status: RUNNING ✅$(NC)"; \
		elif [ "$$STATE" = "stopped" ]; then \
			echo "$(YELLOW)Status: STOPPED (ahorrando costos) 💤$(NC)"; \
			echo "$(YELLOW)💡 Para iniciar: make bastion-start$(NC)"; \
		else \
			echo "$(YELLOW)Status: $$STATE$(NC)"; \
		fi; \
		echo "$(YELLOW)Región: $(AWS_REGION)$(NC)"; \
		echo ""; \
		if [ "$$STATE" = "running" ]; then \
			echo "$(GREEN)Conectar con:$(NC)"; \
			echo "  $$ make bastion-connect"; \
			echo ""; \
			echo "$(YELLOW)💡 Para ahorrar costos: make bastion-stop$(NC)"; \
		fi; \
	else \
		echo "$(YELLOW)⚠️  No hay Bastion desplegado$(NC)"; \
	fi

bastion-stop: ## Detener Bastion Host (ahorra ~$6/mes)
	@echo "$(GREEN)💤 Deteniendo Bastion Host...$(NC)"
	@INSTANCE_ID=$$(aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$INSTANCE_ID" ] && [ "$$INSTANCE_ID" != "None" ]; then \
		STATE=$$(aws ec2 describe-instances \
			--instance-ids "$$INSTANCE_ID" \
			--region $(AWS_REGION) \
			--query 'Reservations[0].Instances[0].State.Name' \
			--output text 2>/dev/null); \
		if [ "$$STATE" = "stopped" ]; then \
			echo "$(YELLOW)⚠️  El Bastion ya está detenido$(NC)"; \
		elif [ "$$STATE" = "running" ]; then \
			echo "$(YELLOW)📋 Instance ID: $$INSTANCE_ID$(NC)"; \
			aws ec2 stop-instances --instance-ids "$$INSTANCE_ID" --region $(AWS_REGION) > /dev/null; \
			echo "$(GREEN)✅ Bastion detenido exitosamente$(NC)"; \
			echo "$(YELLOW)💰 Ahorro estimado: ~$6/mes$(NC)"; \
			echo "$(YELLOW)💡 Para iniciar nuevamente: make bastion-start$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  Estado actual: $$STATE (esperando...)$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ No se encontró instancia Bastion desplegada$(NC)"; \
	fi

bastion-start: ## Iniciar Bastion Host
	@echo "$(GREEN)🚀 Iniciando Bastion Host...$(NC)"
	@INSTANCE_ID=$$(aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$INSTANCE_ID" ] && [ "$$INSTANCE_ID" != "None" ]; then \
		STATE=$$(aws ec2 describe-instances \
			--instance-ids "$$INSTANCE_ID" \
			--region $(AWS_REGION) \
			--query 'Reservations[0].Instances[0].State.Name' \
			--output text 2>/dev/null); \
		if [ "$$STATE" = "running" ]; then \
			echo "$(YELLOW)⚠️  El Bastion ya está ejecutándose$(NC)"; \
		elif [ "$$STATE" = "stopped" ]; then \
			echo "$(YELLOW)📋 Instance ID: $$INSTANCE_ID$(NC)"; \
			aws ec2 start-instances --instance-ids "$$INSTANCE_ID" --region $(AWS_REGION) > /dev/null; \
			echo "$(GREEN)✅ Bastion iniciado exitosamente$(NC)"; \
			echo "$(YELLOW)⏱️  Esperando que esté listo (puede tomar 1-2 minutos)...$(NC)"; \
			aws ec2 wait instance-running --instance-ids "$$INSTANCE_ID" --region $(AWS_REGION); \
			echo "$(GREEN)✅ Bastion listo para usar$(NC)"; \
			echo "$(YELLOW)💡 Conectar con: make bastion-connect$(NC)"; \
		else \
			echo "$(YELLOW)⚠️  Estado actual: $$STATE (esperando...)$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ No se encontró instancia Bastion desplegada$(NC)"; \
	fi

bastion-connect: ## Conectar al Bastion via SSM Session Manager
	@echo "$(GREEN)🚀 Conectando al Bastion via SSM...$(NC)"
	@INSTANCE_ID=$$(aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$INSTANCE_ID" ] && [ "$$INSTANCE_ID" != "None" ]; then \
		echo "$(YELLOW)📋 Instancia: $$INSTANCE_ID$(NC)"; \
		echo "$(YELLOW)ℹ️  Presiona 'exit' para desconectar$(NC)\n"; \
		aws ssm start-session --target "$$INSTANCE_ID" --region $(AWS_REGION); \
	else \
		echo "$(RED)❌ No se encontró instancia Bastion desplegada$(NC)"; \
		echo "$(YELLOW)💡 Asegúrate de desplegar con: make deploy COGNITO_POOL_ID=tu_id$(NC)"; \
	fi

bastion-psql: ## Conectar a PostgreSQL via Bastion
	@echo "$(GREEN)🐘 Conectando a PostgreSQL via Bastion...$(NC)"
	@echo "$(YELLOW)   Una vez conectado podrás:$(NC)"
	@echo "$(YELLOW)   • Ver tablas: \\dt$(NC)"
	@echo "$(YELLOW)   • Ver estructura: \\d tabla$(NC)"
	@echo "$(YELLOW)   • Ver datos: SELECT * FROM tabla LIMIT 10;$(NC)"
	@echo "$(YELLOW)   • Salir: \\q$(NC)"
	@echo ""
	@INSTANCE_ID=$$(aws cloudformation describe-stacks \
		--stack-name UserServiceStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$INSTANCE_ID" ] && [ "$$INSTANCE_ID" != "None" ]; then \
		echo "$(YELLOW)📋 Instancia: $$INSTANCE_ID$(NC)"; \
		\
		SECRET_ARN=$$(aws cloudformation describe-stacks \
			--stack-name UserServiceStack \
			--region $(AWS_REGION) \
			--query 'Stacks[0].Outputs[?contains(OutputKey, `SecretArn`)].OutputValue' \
			--output text 2>/dev/null); \
		\
		if [ -n "$$SECRET_ARN" ]; then \
			SECRET_JSON=$$(aws secretsmanager get-secret-value \
				--secret-id "$$SECRET_ARN" \
				--region $(AWS_REGION) \
				--query 'SecretString' \
				--output text); \
			\
			DB_ENDPOINT=$$(echo "$$SECRET_JSON" | jq -r '.host'); \
			DB_USER=$$(echo "$$SECRET_JSON" | jq -r '.username'); \
			DB_PASSWORD=$$(echo "$$SECRET_JSON" | jq -r '.password'); \
			DB_NAME="evilent_users"; \
			\
			echo "$(GREEN)✅ Credenciales obtenidas$(NC)"; \
			echo "$(YELLOW)🐘 Conectando al Bastion...$(NC)"; \
			echo "$(YELLOW)   Una vez dentro, ejecuta:$(NC)"; \
			echo "$(YELLOW)   PGPASSWORD='$$DB_PASSWORD' psql -h '$$DB_ENDPOINT' -U '$$DB_USER' -d '$$DB_NAME'$(NC)"; \
			echo "$(YELLOW)   Para salir: exit$(NC)"; \
			echo ""; \
			\
			aws ssm start-session --target "$$INSTANCE_ID" --region $(AWS_REGION); \
		else \
			echo "$(RED)❌ No se pudo obtener el Secret ARN$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ No se encontró instancia Bastion desplegada$(NC)"; \
		echo "$(YELLOW)💡 Asegúrate de desplegar con: make deploy COGNITO_POOL_ID=tu_id$(NC)"; \
	fi

bastion-migrate: ## Ejecutar migraciones de DB via Bastion
	@echo "$(GREEN)🚀 Ejecutando migraciones AUTOMÁTICAS...$(NC)"
	@echo "$(YELLOW)   Esto debería funcionar sin intervención manual$(NC)"
	@echo "$(YELLOW)   Si falla, ejecuta: make setup-db-env$(NC)"
	@echo ""
	@if [ ! -f ".db-env.tmp" ]; then \
		echo "$(RED)❌ Variables de DB no configuradas$(NC)"; \
		echo "$(YELLOW)💡 Ejecuta primero: make setup-db-env$(NC)"; \
		exit 1; \
	fi
	@source .db-env.tmp && bash run-migrations-with-creds.sh || (echo "$(RED)❌ Error en migraciones$(NC)" && exit 1)

# ============================================
# 4️⃣ LIMPIEZA Y DESTRUCCIÓN
# ============================================

destroy-service: ## Eliminar solo el servicio (mantiene políticas IAM - RECOMENDADO para desarrollo)
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🗑️  Eliminando solo el servicio (políticas se mantienen) ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)✅ Ventajas de mantener políticas IAM:$(NC)"
	@echo "  • Políticas IAM son GRATUITAS ($0 de costo)"
	@echo "  • Redeploy más rápido (políticas ya existen)"
	@echo "  • Permisos de usuario se mantienen"
	@echo ""
	@echo "$(YELLOW)Recursos que se eliminarán:$(NC)"
	@echo "  • Lambda functions"
	@echo "  • API Gateway"
	@echo "  • RDS PostgreSQL (~$$18/mes)"
	@echo "  • VPC Endpoints (~$$7.5/mes)"
	@echo "  • Bastion EC2 (~$$5/mes)"
	@echo "  • Security Groups"
	@echo "  • Secrets Manager"
	@echo ""
	@echo "$(GREEN)Recursos que se MANTIENEN ($0 costo):$(NC)"
	@echo "  • ✅ IamPoliciesStack"
	@echo "  • ✅ EvilentDeveloperBastionPolicy"
	@echo "  • ✅ Permisos de usuario skynet-developer"
	@echo ""
	@echo "$(YELLOW)⏱️  Tiempo estimado: 15-20 minutos$(NC)"
	@echo ""
	@echo "$(YELLOW)Presiona Ctrl+C para CANCELAR o Enter para CONTINUAR...$(NC)"
	@read confirm
	@echo ""
	@echo "$(YELLOW)🗑️  Eliminando UserServiceStack...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk destroy UserServiceStack --force
	@echo ""
	@echo "$(GREEN)✅ UserServiceStack eliminado$(NC)"
	@echo "$(GREEN)✅ Políticas IAM mantenidas (listas para próximo deploy)$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Para redeploy rápido:$(NC)"
	@echo "  $$ make deploy COGNITO_POOL_ID=xxx"
	@echo ""
	@echo "$(YELLOW)💡 Para eliminar TODO (incluyendo políticas):$(NC)"
	@echo "  $$ make destroy"

destroy: ## Eliminar el servicio (políticas IAM se mantienen en ../iam-policies/)
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  ⚠️  ADVERTENCIA: Esto eliminará el servicio             ║$(NC)"
	@echo "$(RED)║  ℹ️  Las políticas IAM se mantienen (gestionadas aparte) ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Proceso de eliminación:$(NC)"
	@echo "  1. Eliminar UserServiceStack"
	@echo "  2. (Políticas IAM se mantienen en IamPoliciesStack)"
	@echo ""
	@echo "$(YELLOW)Recursos que se eliminarán:$(NC)"
	@echo "  • Lambda functions"
	@echo "  • API Gateway"
	@echo "  • RDS PostgreSQL (base de datos)"
	@echo "  • VPC y subnets"
	@echo "  • Security Groups"
	@echo "  • Secrets Manager"
	@echo "  • VPC Endpoints"
	@echo ""
	@echo "$(GREEN)Recursos que se MANTIENEN:$(NC)"
	@echo "  • ✅ IamPoliciesStack (gestionado en ../iam-policies/)"
	@echo "  • ✅ Políticas IAM"
	@echo "  • ✅ Permisos de usuario"
	@echo ""
	@echo "$(YELLOW)⏱️  Tiempo estimado: 15-30 minutos (RDS es lento)$(NC)"
	@echo ""
	@echo "$(RED)Presiona Ctrl+C para CANCELAR o Enter para CONTINUAR...$(NC)"
	@read confirm
	@echo ""
	@echo "$(YELLOW)🗑️  Eliminando UserServiceStack...$(NC)"
	@CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk destroy UserServiceStack --force
	@echo ""
	@echo "$(GREEN)✅ UserServiceStack eliminado$(NC)"
	@echo "$(GREEN)✅ Políticas IAM mantenidas (gestionadas en ../iam-policies/)$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Para eliminar políticas IAM:$(NC)"
	@echo "$(YELLOW)   cd ../iam-policies && make destroy$(NC)"

clean: ## Limpiar archivos compilados
	@echo "$(YELLOW)🧹 Limpiando archivos compilados...$(NC)"
	rm -rf lib/*.js lib/*.d.ts bin/*.js bin/*.d.ts src/*.js src/*.d.ts
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# ============================================
# 5️⃣ UTILIDADES (avanzado)
# ============================================

diff: build ## Ver diferencias con el stack del servicio desplegado
	@if [ -z "$(COGNITO_POOL_ID)" ] || [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID$(NC)"; \
		echo "$(YELLOW)Uso: make diff COGNITO_POOL_ID=eu-central-1_abc123 COGNITO_APP_CLIENT_ID=xyz123$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)🔍 Comparando cambios en UserServiceStack...$(NC)"
	npx cdk diff UserServiceStack -c cognitoPoolId=$(COGNITO_POOL_ID) -c cognitoAppClientId=$(COGNITO_APP_CLIENT_ID) -c withDatabase=true -c multiAz=false

synth: build ## Sintetizar template de CloudFormation
	@if [ -z "$(COGNITO_POOL_ID)" ] || [ -z "$(COGNITO_APP_CLIENT_ID)" ]; then \
		echo "$(RED)❌ ERROR: Debes configurar COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID$(NC)"; \
		echo "$(YELLOW)Uso: make synth COGNITO_POOL_ID=eu-central-1_abc123 COGNITO_APP_CLIENT_ID=xyz123$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📄 Sintetizando template de UserServiceStack...$(NC)"
	npx cdk synth UserServiceStack -c cognitoPoolId=$(COGNITO_POOL_ID) -c cognitoAppClientId=$(COGNITO_APP_CLIENT_ID) -c withDatabase=true -c multiAz=false

# ============================================
# 🧪 TESTING
# ============================================
# Diferentes tipos de tests según tu necesidad:
#
# 1. test-unit        → Rápidos, sin dependencias (mocks)
# 2. test-integration → Requiere API desplegada en AWS
# 3. test-database    → Requiere RDS PostgreSQL + Secrets Manager
# 4. test-all         → Ejecuta TODOS los tests anteriores
# ============================================

.PHONY: test-all test-unit test-integration test-database setup-db-env test-info

test-info: ## 📖 Explicación de los tipos de tests disponibles
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🧪 TIPOS DE TESTS DISPONIBLES                            ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)1️⃣  TESTS UNITARIOS (test-unit)$(NC)"
	@echo "    ✅ Funcionan siempre, sin dependencias externas"
	@echo "    ✅ Usan mocks para simular servicios"
	@echo "    ✅ Rápidos (< 5 segundos)"
	@echo "    📝 Comando: $(YELLOW)make test-unit$(NC)"
	@echo ""
	@echo "$(GREEN)2️⃣  TESTS DE INTEGRACIÓN HTTP (test-integration)$(NC)"
	@echo "    ⚠️  Requiere: API Gateway + Lambda desplegados"
	@echo "    ✅ Valida endpoints reales en AWS"
	@echo "    ✅ Incluye autenticación con Cognito"
	@echo "    ⏱️  Duración: ~30-60 segundos"
	@echo "    📝 Comando: $(YELLOW)make test-integration$(NC)"
	@echo ""
	@echo "$(GREEN)3️⃣  TESTS DE BASE DE DATOS (test-database)$(NC)"
	@echo "    🏗️  Requiere: RDS PostgreSQL + Secrets Manager + Bastion"
	@echo "    ✅ Conecta REALMENTE a PostgreSQL (sin mocks)"
	@echo "    ✅ Valida CRUD, constraints, transacciones ACID"
	@echo "    ⏱️  Duración: ~20-40 segundos"
	@echo "    📝 Setup: $(YELLOW)make setup-db-env$(NC) (solo primera vez)"
	@echo "    📝 Comando: $(YELLOW)make test-database$(NC)"
	@echo ""
	@echo "$(GREEN)4️⃣  TODOS LOS TESTS (test-all)$(NC)"
	@echo "    🚀 Ejecuta: Unitarios + Integración + Database"
	@echo "    ⚠️  Requiere: TODA la infraestructura desplegada"
	@echo "    ⏱️  Duración: ~1-2 minutos"
	@echo "    📝 Comando: $(YELLOW)make test-all$(NC)"
	@echo ""
	@echo "$(BLUE)════════════════════════════════════════════════════════════$(NC)"

test-unit: ## 🧪 Tests unitarios (SIN dependencias, usan mocks)
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🧪 TESTS UNITARIOS (Mocks)                               ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)✅ Requisitos: NINGUNO (funcionan siempre)$(NC)"
	@echo "$(GREEN)⚡ Velocidad: Muy rápidos (< 5 segundos)$(NC)"
	@echo ""
	npm run test:unit

test-integration: ## 🌐 Tests de integración HTTP (REQUIERE: API desplegada)
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🌐 TESTS DE INTEGRACIÓN HTTP                             ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  REQUISITOS:$(NC)"
	@echo "   • API Gateway desplegada: $(GREEN)make deploy COGNITO_POOL_ID=xxx$(NC)"
	@echo "   • Lambda function activa"
	@echo "   • Cognito User Pool configurado"
	@echo ""
	@echo "$(GREEN)🚀 Ejecutando tests contra API real en AWS...$(NC)"
	@echo ""
	npm run test:integration

test-database: ## [DB] Tests de base de datos (REQUIERE: RDS + Secrets + Bastion)
test-database-proxy: ## [DB] Tests DB con tunel automatico SSM (RECOMENDADO)
	@echo "$(BLUE)Sistema de tunel automatico implementado!$(NC)"
	@echo "$(YELLOW)Para usar:$(NC)"
	@echo "  1. make setup-db-env"
	@echo "  2. make test-database-proxy"

	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  [DB] TESTS DE BASE DE DATOS POSTGRESQL                    ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)[!] REQUISITOS (Infraestructura Real):$(NC)"
	@echo "   1. RDS PostgreSQL desplegado"
	@echo "   2. AWS Secrets Manager con credenciales"
	@echo "   3. Bastion Host ejecutándose"
	@echo "   4. Variables de entorno configuradas"
	@echo ""
	@if [ ! -f ".db-env.tmp" ]; then \
		echo "$(RED)❌ ERROR: Variables de entorno NO configuradas$(NC)"; \
		echo ""; \
		echo "$(YELLOW)🔧 SOLUCIÓN:$(NC)"; \
		echo "   $(GREEN)make setup-db-env$(NC)  # Configuración automática"; \
		echo ""; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Variables de entorno configuradas correctamente$(NC)"
	@source .db-env.tmp && echo "   DB_SECRET_ARN: $$DB_SECRET_ARN" && echo "   DB_ENDPOINT: $$DB_ENDPOINT"
	@echo ""
	@echo "$(GREEN)🚀 Ejecutando tests contra PostgreSQL real...$(NC)"
	@echo ""
	@source .db-env.tmp && TUNNEL_AUTO_MODE=true ./create-db-tunnel.sh
test-all: ## 🚀 TODOS los tests (unitarios + integración + database)
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🚀 EJECUTANDO TODOS LOS TESTS                            ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)⚠️  ADVERTENCIA: Esto ejecutará:$(NC)"
	@echo "   1️⃣  Tests Unitarios (mocks)"
	@echo "   2️⃣  Tests de Integración HTTP (API real)"
	@echo "   3️⃣  Tests de Base de Datos (PostgreSQL real)"
	@echo ""
	@echo "$(YELLOW)⏱️  Duración estimada: 1-2 minutos$(NC)"
	@echo ""
	@if [ ! -f ".db-env.tmp" ]; then \
		echo "$(RED)❌ ERROR: Variables de entorno para DB tests no configuradas$(NC)"; \
		echo "$(YELLOW)💡 Ejecutar primero: make setup-db-env$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)🚀 Iniciando suite completa de tests...$(NC)"
	@echo ""
	npm test

setup-db-env: ## 🔧 Configurar variables de entorno para Database Tests
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║  🔧 CONFIGURACIÓN DE ENTORNO PARA DB TESTS                ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)📋 Este script obtendrá automáticamente:$(NC)"
	@echo "   • DB_SECRET_ARN (desde CloudFormation outputs)"
	@echo "   • DB_ENDPOINT (desde CloudFormation outputs)"
	@echo "   • DB_NAME (desde CloudFormation outputs)"
	@echo ""
	@if [ ! -f "./setup-db-test-env.sh" ]; then \
		echo "$(RED)❌ ERROR: Script setup-db-test-env.sh no encontrado$(NC)"; \
		exit 1; \
	fi
	@chmod +x ./setup-db-test-env.sh
	@./setup-db-test-env.sh
	@echo ""
	@echo "$(GREEN)✅ Configuración completada$(NC)"
	@echo "$(YELLOW)💡 Ahora puedes ejecutar: make test-database$(NC)"

# ============================================
# COMANDO POR DEFECTO
# ============================================
.DEFAULT_GOAL := help
