// 🎯 TEST HELPERS - Funciones auxiliares reutilizables
// Estas son funciones comunes para tests de widgets

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// Espera a que la UI se actualice completamente
Future<void> waitForUI(WidgetTester tester) async {
  await tester.pumpAndSettle();
}

/// Entra texto en un TextField por índice
Future<void> enterTextAtIndex(
  WidgetTester tester,
  int index,
  String text,
) async {
  await tester.enterText(find.byType(TextField).at(index), text);
  await tester.pump();
}

/// Tapa un botón por texto
Future<void> tapButtonByText(WidgetTester tester, String text) async {
  await tester.tap(find.text(text));
  await tester.pumpAndSettle();
}

/// Verifica que un texto esté en pantalla
void expectTextPresent(WidgetTester tester, String text) {
  expect(find.text(text), findsOneWidget);
}

/// Verifica que un texto NO esté en pantalla
void expectTextAbsent(WidgetTester tester, String text) {
  expect(find.text(text), findsNothing);
}

/// Verifica que hay múltiples widgets de un tipo
void expectMultipleWidgets(WidgetTester tester, Type widgetType, int count) {
  expect(find.byType(widgetType), findsNWidgets(count));
}

/// Obtiene el primer widget de un tipo
T findFirstWidget<T extends Widget>(WidgetTester tester) {
  return find.byType(T).evaluate().first.widget as T;
}

/// Obtiene el texto de un widget Text
String? getTextFromWidget(WidgetTester tester, String text) {
  try {
    return (find.text(text).evaluate().first.widget as Text).data;
  } catch (e) {
    return null;
  }
}

