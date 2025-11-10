import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/services/connectivity_service.dart';
import 'package:flutter/material.dart';
import 'package:evilent_app/core/utils/app_dimens.dart';
import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:evilent_app/core/utils/locator.dart';

// Banner global que se muestra cuando no hay conexión a internet.
class ConnectivityBanner extends StatelessWidget {
  const ConnectivityBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final connectivityService = locator<ConnectivityService>();
    
    // Usar ListenableBuilder en lugar de ValueListenableBuilder
    return ListenableBuilder(
      listenable: connectivityService,
      builder: (context, _) {
        if (connectivityService.isConnected) {
          return const SizedBox.shrink();
        }
        
        return Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(
            horizontal: AppDimens.spacingMedium,
            vertical: AppDimens.spacingSmall,
          ),
          decoration: BoxDecoration(
            color: context.errorContainerColor,
            border: Border(
              top: BorderSide(
                color: context.errorColor,
                width: 1.0,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(
                      Icons.wifi_off,
                      size: 20,
                      color: context.onErrorContainerColor,
                    ),
                    SizedBox(width: AppDimens.spacingSmall),
                    Expanded(
                      child: Text(
                        'Sin conexión a internet',
                        style: TextStyle(
                          color: context.onErrorContainerColor,
                          fontSize: AppDimens.fontMedium,
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => connectivityService.forceCheck(),
                style: TextButton.styleFrom(
                  foregroundColor: context.onErrorContainerColor,
                  padding: EdgeInsets.symmetric(
                    horizontal: AppDimens.spacingSmall,
                    vertical: 4,
                  ),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Row(
                  children: [
                    Icon(
                      AppIcons.refresh,
                      size: 16,
                    ),
                    SizedBox(width: AppDimens.spacingSmall / 2),
                    Text(
                      'Reintentar',
                      style: TextStyle(
                        fontSize: AppDimens.fontBody,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}