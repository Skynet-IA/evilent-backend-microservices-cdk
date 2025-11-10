import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/utils/app_colors.dart';
import 'package:evilent_app/core/utils/app_dimens.dart';
import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Pantalla mostrada cuando falla la configuración de Amplify.
class AmplifyErrorScreen extends StatelessWidget {
  final Function() onRetry;

  const AmplifyErrorScreen({super.key, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(context.spacingMedium),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Error de Configuración',
                style: context.headlineMedium,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.spacingMedium),
              Text(
                'No se pudo inicializar el sistema de autenticación.\nPor favor, verifica tu conexión e intenta nuevamente.',
                style: context.bodyMedium.copyWith(height: 1.5, color: context.onSurfaceVariantColor,),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.spacingXL),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: Icon(AppIcons.refresh),
                label: Text('Reintentar'),
                style: ElevatedButton.styleFrom(
                  // .w y .h adaptan el padding al ancho y alto de la pantalla.
                  padding:
                      EdgeInsets.symmetric(horizontal: context.spacingXL, vertical: context.spacingMedium),
                  textStyle: context.labelLarge,
                ),
              ),
              // Espacio vertical.
              SizedBox(height: context.spacingMedium),
              // Botón secundario para cerrar la aplicación.
              TextButton(
                // SystemNavigator.pop() cierra la aplicación de forma segura.
                onPressed: () => SystemNavigator.pop(),
                child: Text(
                  'Cerrar aplicación',
                  style: context.bodyMedium.copyWith(
                    fontSize: AppDimens.fontBody,
                    color: AppColors.info,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
