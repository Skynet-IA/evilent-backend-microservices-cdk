import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Modelo simple de item del carrito
class CartItem {
  final String id;
  final String name;
  final double price;
  final int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
  });

  CartItem copyWith({
    String? id,
    String? name,
    double? price,
    int? quantity,
  }) {
    return CartItem(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
    );
  }
}

/// Estado del carrito
class CartState {
  final List<CartItem> items;
  final bool isLoading;
  final String? errorMessage;

  CartState({
    this.items = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  CartState copyWith({
    List<CartItem>? items,
    bool? isLoading,
    String? errorMessage,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  double get total => items.fold(
        0,
        (sum, item) => sum + (item.price * item.quantity),
      );

  int get itemCount => items.fold(
        0,
        (sum, item) => sum + item.quantity,
      );
}

/// Notifier para manejar el estado del carrito
class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() {
    // Inicializar con un carrito vacío
    return CartState();
  }

  /// Agregar un item al carrito
  void addItem(CartItem item) {
    final existingIndex = state.items.indexWhere((i) => i.id == item.id);

    if (existingIndex >= 0) {
      // Si ya existe, incrementar cantidad
      final updatedItems = [...state.items];
      updatedItems[existingIndex] = updatedItems[existingIndex].copyWith(
        quantity: updatedItems[existingIndex].quantity + item.quantity,
      );
      state = state.copyWith(items: updatedItems);
    } else {
      // Si no existe, agregar nuevo
      state = state.copyWith(items: [...state.items, item]);
    }
  }

  /// Remover un item del carrito
  void removeItem(String itemId) {
    state = state.copyWith(
      items: state.items.where((item) => item.id != itemId).toList(),
    );
  }

  /// Actualizar cantidad de un item
  void updateQuantity(String itemId, int newQuantity) {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    final updatedItems = state.items.map((item) {
      if (item.id == itemId) {
        return item.copyWith(quantity: newQuantity);
      }
      return item;
    }).toList();

    state = state.copyWith(items: updatedItems);
  }

  /// Limpiar el carrito
  void clearCart() {
    state = state.copyWith(items: []);
  }
}

/// Provider del carrito
final cartProvider = NotifierProvider<CartNotifier, CartState>(
  CartNotifier.new,
);

/// Provider derivado para obtener solo la cantidad de items
final cartItemCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider).itemCount;
});

/// Provider derivado para obtener el total del carrito
final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider).total;
});

