import 'package:flutter/material.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import '../models/user_profile.dart';

class ProfileForm extends StatefulWidget {
  final UserProfile initialProfile;
  final Function(UserProfile) onSave;
  final bool isLoading;

  const ProfileForm({
    super.key,
    required this.initialProfile,
    required this.onSave,
    this.isLoading = false,
  });

  @override
  State<ProfileForm> createState() => _ProfileFormState();
}

class _ProfileFormState extends State<ProfileForm> {
  late UserProfile _currentProfile;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _currentProfile = widget.initialProfile;
  }

  void _handleSave() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      widget.onSave(_currentProfile);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Campo de Nombre
          TextFormField(
            initialValue: _currentProfile.firstName,
            decoration: InputDecoration(
              labelText: 'Nombre',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.person_outline),
            ),
            textCapitalization: TextCapitalization.words,
            validator: (value) => Validation.validateName(value, fieldName: 'El nombre'),
            onSaved: (value) => _currentProfile.firstName = value?.trim(),
          ),
          
          SizedBox(height: context.spacingMedium),
          
          // Campo de Apellido (opcional)
          TextFormField(
            initialValue: _currentProfile.lastName,
            decoration: InputDecoration(
              labelText: 'Apellido (opcional)',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.person_outline),
            ),
            textCapitalization: TextCapitalization.words,
            validator: Validation.validateLastName,
            onSaved: (value) {
              final trimmed = value?.trim();
              _currentProfile.lastName = (trimmed == null || trimmed.isEmpty) ? null : trimmed;
            },
          ),
          
          SizedBox(height: context.spacingMedium),
          
          // Campo de Teléfono
          TextFormField(
            initialValue: _currentProfile.phone,
            decoration: InputDecoration(
              labelText: 'Teléfono',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.phone_outlined),
              hintText: '+1234567890',
            ),
            keyboardType: TextInputType.phone,
            validator: Validation.validatePhone,
            onSaved: (value) {
              // Limpiar el teléfono antes de guardarlo (eliminar espacios, guiones, paréntesis)
              _currentProfile.phone = value != null ? Validation.cleanPhone(value) : null;
            },
          ),
          
          SizedBox(height: context.spacingLarge),
          
          // Información adicional
          Container(
            padding: EdgeInsets.all(context.spacingSmall),
            decoration: BoxDecoration(
              color: context.primaryContainerColor.withOpacity(0.3),
              borderRadius: BorderRadius.circular(context.radiusSmall),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.info_outline,
                  size: 20,
                  color: context.primaryColor,
                ),
                SizedBox(width: context.spacingSmall),
                Expanded(
                  child: Text(
                    _currentProfile.userType == 'SELLER'
                        ? 'Como vendedor podrás publicar tus productos'
                        : 'Como comprador podrás explorar y comprar productos',
                    style: context.bodySmall.copyWith(
                      color: context.onSurfaceVariantColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: context.spacingXL),
          
          // Botón de Guardar
          SizedBox(
            width: double.infinity,
            height: context.buttonHeightLarge,
            child: ElevatedButton(
              onPressed: widget.isLoading ? null : _handleSave,
              style: ElevatedButton.styleFrom(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(context.radiusMedium),
                ),
              ),
              child: widget.isLoading
                  ? SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          context.onPrimaryColor,
                        ),
                      ),
                    )
                  : Text(
                      'Guardar Perfil',
                      style: context.labelLarge.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
