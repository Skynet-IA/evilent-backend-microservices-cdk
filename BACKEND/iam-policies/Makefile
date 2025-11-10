# ============================================
# Makefile - IAM Policies (AWS CDK)
# ============================================
# Políticas IAM compartidas para todos los servicios Evilent
#
# Uso básico:
#   make deploy          # Desplegar políticas
#   make apply-all       # Aplicar a usuario desarrollador
#   make destroy         # Eliminar políticas
# ============================================

.PHONY: help install build deploy apply-user-service apply-product-service apply-shared apply-all detach-all destroy clean diff synth status outputs verify

# ============================================
# VARIABLES
# ============================================
AWS_REGION = eu-central-1
IAM_USER = skynet-developer

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
	@echo "$(GREEN)║         IAM POLICIES - COMANDOS DISPONIBLES               ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  🚀 SETUP INICIAL (ejecutar en orden)                    ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  1️⃣  make install            # Instalar dependencias"
	@echo "  2️⃣  make deploy              # Desplegar políticas IAM"
	@echo "  3️⃣  make apply-all           # Aplicar TODAS las políticas al usuario"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  📊 GESTIÓN DE POLÍTICAS                                  ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make apply-user-service      # Solo User Service"
	@echo "  make apply-product-service   # Solo Product Service"
	@echo "  make apply-shared            # Solo Monitoreo Compartido"
	@echo "  make status                  # Ver estado del stack"
	@echo "  make outputs                 # Ver ARNs de políticas"
	@echo "  make verify                  # Verificar políticas aplicadas"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🗑️  LIMPIEZA                                             ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make detach-all              # Detach TODAS las políticas"
	@echo "  make destroy                 # Eliminar stack (requiere detach primero)"
	@echo "  make clean                   # Limpiar archivos compilados"
	@echo ""
	@echo "$(YELLOW)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(YELLOW)║  🛠️  UTILIDADES                                           ║$(NC)"
	@echo "$(YELLOW)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo "  make build                   # Compilar TypeScript"
	@echo "  make diff                    # Ver diferencias"
	@echo "  make synth                   # Sintetizar template"
	@echo ""
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  AWS_REGION = $(AWS_REGION)"
	@echo "  IAM_USER = $(IAM_USER)"
	@echo "$(GREEN)════════════════════════════════════════════════════════════$(NC)"

# ============================================
# 1️⃣ SETUP INICIAL
# ============================================

install: ## [PASO 1] Instalar dependencias npm
	@echo "$(GREEN)📦 [1/3] Instalando dependencias...$(NC)"
	npm install
	@echo "$(GREEN)✅ Instalación completada$(NC)"
	@echo "$(YELLOW)💡 Siguiente: make deploy$(NC)"

deploy: build ## [PASO 2] Desplegar políticas IAM
	@echo "$(GREEN)🔐 [2/3] Desplegando políticas IAM compartidas...$(NC)"
	@echo "$(YELLOW)📋 Stack: IamPoliciesStack$(NC)"
	@echo "$(YELLOW)📋 Políticas:$(NC)"
	@echo "   ├─ EvilentUserServiceDeveloperPolicy"
	@echo "   ├─ EvilentProductServiceDeveloperPolicy"
	@echo "   └─ EvilentSharedMonitoringPolicy"
	@echo ""
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk deploy --require-approval never
	@echo ""
	@echo "$(GREEN)✅ Políticas IAM desplegadas$(NC)"
	@echo "$(YELLOW)💡 Siguiente: make apply-all$(NC)"

apply-all: apply-user-service apply-product-service apply-shared ## [PASO 3] Aplicar TODAS las políticas al usuario
	@echo ""
	@echo "$(GREEN)✅ TODAS las políticas aplicadas exitosamente$(NC)"
	@echo "$(YELLOW)💡 Usuario: $(IAM_USER)$(NC)"
	@echo "$(YELLOW)💡 Verificar: make status$(NC)"

# ============================================
# 2️⃣ APLICAR POLÍTICAS INDIVIDUALES
# ============================================

apply-user-service: ## Aplicar política de User Service
	@echo "$(GREEN)🔐 Aplicando política de User Service...$(NC)"
	@POLICY_ARN=$$(aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?OutputKey==`UserServicePolicyArn`].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$POLICY_ARN" ] && [ "$$POLICY_ARN" != "None" ]; then \
		echo "$(YELLOW)🔗 ARN: $$POLICY_ARN$(NC)"; \
		aws iam attach-user-policy \
			--user-name $(IAM_USER) \
			--policy-arn "$$POLICY_ARN" \
			--region $(AWS_REGION) 2>/dev/null || echo "$(YELLOW)   Ya aplicada$(NC)"; \
		echo "$(GREEN)✅ Política User Service aplicada$(NC)"; \
	else \
		echo "$(RED)❌ No se encontró IamPoliciesStack$(NC)"; \
		exit 1; \
	fi

apply-product-service: ## Aplicar política de Product Service
	@echo "$(GREEN)🔐 Aplicando política de Product Service...$(NC)"
	@POLICY_ARN=$$(aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?OutputKey==`ProductServicePolicyArn`].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$POLICY_ARN" ] && [ "$$POLICY_ARN" != "None" ]; then \
		echo "$(YELLOW)🔗 ARN: $$POLICY_ARN$(NC)"; \
		aws iam attach-user-policy \
			--user-name $(IAM_USER) \
			--policy-arn "$$POLICY_ARN" \
			--region $(AWS_REGION) 2>/dev/null || echo "$(YELLOW)   Ya aplicada$(NC)"; \
		echo "$(GREEN)✅ Política Product Service aplicada$(NC)"; \
	else \
		echo "$(RED)❌ No se encontró IamPoliciesStack$(NC)"; \
		exit 1; \
	fi

apply-shared: ## Aplicar política compartida de monitoreo
	@echo "$(GREEN)🔐 Aplicando política compartida...$(NC)"
	@POLICY_ARN=$$(aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs[?OutputKey==`SharedMonitoringPolicyArn`].OutputValue' \
		--output text 2>/dev/null); \
	if [ -n "$$POLICY_ARN" ] && [ "$$POLICY_ARN" != "None" ]; then \
		echo "$(YELLOW)🔗 ARN: $$POLICY_ARN$(NC)"; \
		aws iam attach-user-policy \
			--user-name $(IAM_USER) \
			--policy-arn "$$POLICY_ARN" \
			--region $(AWS_REGION) 2>/dev/null || echo "$(YELLOW)   Ya aplicada$(NC)"; \
		echo "$(GREEN)✅ Política compartida aplicada$(NC)"; \
	else \
		echo "$(RED)❌ No se encontró IamPoliciesStack$(NC)"; \
		exit 1; \
	fi

# ============================================
# 3️⃣ INFORMACIÓN Y ESTADO
# ============================================

status: ## Ver estado del stack
	@echo "$(GREEN)📊 Estado del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].[StackName, StackStatus, CreationTime]' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

outputs: ## Ver ARNs de todas las políticas
	@echo "$(GREEN)📤 Outputs del Stack:$(NC)"
	@echo ""
	@aws cloudformation describe-stacks \
		--stack-name IamPoliciesStack \
		--region $(AWS_REGION) \
		--query 'Stacks[0].Outputs' \
		--output table 2>/dev/null || echo "$(YELLOW)Stack no encontrado$(NC)"

verify: ## Verificar políticas aplicadas al usuario
	@echo "$(GREEN)🔍 Verificando políticas aplicadas a $(IAM_USER)...$(NC)"
	@echo ""
	@echo "$(YELLOW)Políticas Evilent attached:$(NC)"
	@aws iam list-attached-user-policies \
		--user-name $(IAM_USER) \
		--region $(AWS_REGION) \
		--query 'AttachedPolicies[?contains(PolicyName, `Evilent`)]' \
		--output table 2>/dev/null || echo "$(RED)Usuario no encontrado o sin políticas$(NC)"
	@echo ""
	@echo "$(YELLOW)💡 Para ver todas las políticas: aws iam list-attached-user-policies --user-name $(IAM_USER)$(NC)"

# ============================================
# 4️⃣ LIMPIEZA Y DESTRUCCIÓN
# ============================================

detach-all: ## Detach TODAS las políticas del usuario
	@echo "$(YELLOW)🗑️  Detaching TODAS las políticas de $(IAM_USER)...$(NC)"
	@echo ""
	@for OUTPUT_KEY in UserServicePolicyArn ProductServicePolicyArn SharedMonitoringPolicyArn; do \
		POLICY_ARN=$$(aws cloudformation describe-stacks \
			--stack-name IamPoliciesStack \
			--region $(AWS_REGION) \
			--query "Stacks[0].Outputs[?OutputKey=='$$OUTPUT_KEY'].OutputValue" \
			--output text 2>/dev/null || echo ""); \
		if [ -n "$$POLICY_ARN" ] && [ "$$POLICY_ARN" != "None" ]; then \
			echo "$(YELLOW)Detaching $$OUTPUT_KEY...$(NC)"; \
			aws iam detach-user-policy \
				--user-name $(IAM_USER) \
				--policy-arn "$$POLICY_ARN" \
				--region $(AWS_REGION) 2>/dev/null || echo "$(YELLOW)   Ya detached$(NC)"; \
		fi; \
	done
	@echo ""
	@echo "$(GREEN)✅ Todas las políticas detached$(NC)"

destroy: ## Eliminar stack de políticas (requiere detach primero)
	@echo "$(RED)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(RED)║  ⚠️  ADVERTENCIA: Esto eliminará TODAS las políticas IAM ║$(NC)"
	@echo "$(RED)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Políticas que se eliminarán:$(NC)"
	@echo "  • EvilentUserServiceDeveloperPolicy"
	@echo "  • EvilentProductServiceDeveloperPolicy"
	@echo "  • EvilentSharedMonitoringPolicy"
	@echo ""
	@echo "$(YELLOW)⚠️  Asegúrate de haber ejecutado: make detach-all$(NC)"
	@echo ""
	@echo "$(RED)Presiona Ctrl+C para CANCELAR o Enter para CONTINUAR...$(NC)"
	@read confirm
	@echo ""
	@echo "$(YELLOW)🗑️  Eliminando IamPoliciesStack...$(NC)"
	CDK_DEFAULT_ACCOUNT=$$(aws sts get-caller-identity --query Account --output text) \
	CDK_DEFAULT_REGION=$(AWS_REGION) \
	npx cdk destroy --force
	@echo ""
	@echo "$(GREEN)✅ IamPoliciesStack eliminado$(NC)"

clean: ## Limpiar archivos compilados
	@echo "$(YELLOW)🧹 Limpiando archivos compilados...$(NC)"
	rm -rf dist
	rm -rf cdk.out
	rm -rf lib/**/*.js lib/**/*.d.ts
	rm -rf bin/*.js bin/*.d.ts
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# ============================================
# 5️⃣ UTILIDADES
# ============================================

build: ## Compilar TypeScript
	@echo "$(GREEN)🔨 Compilando TypeScript...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Compilación exitosa$(NC)"

diff: build ## Ver diferencias con el stack desplegado
	@echo "$(GREEN)🔍 Comparando cambios...$(NC)"
	npx cdk diff

synth: build ## Sintetizar template de CloudFormation
	@echo "$(GREEN)📄 Sintetizando template...$(NC)"
	npx cdk synth

# ============================================
# COMANDO POR DEFECTO
# ============================================
.DEFAULT_GOAL := help

