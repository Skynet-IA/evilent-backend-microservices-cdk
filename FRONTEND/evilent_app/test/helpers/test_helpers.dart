// 🎯 TEST HELPERS - Funciones auxiliares reutilizables

import 'package:flutter/material.dart';

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

/// Scrollea hacia abajo
Future<void> scrollDown(WidgetTester tester) async {
  await tester.scroll(find.byType(ListView), const Offset(0, -300));
  await tester.pumpAndSettle();
}

/// Scrollea hacia arriba
Future<void> scrollUp(WidgetTester tester) async {
  await tester.scroll(find.byType(ListView), const Offset(0, 300));
  await tester.pumpAndSettle();
}

