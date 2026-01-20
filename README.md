# 🚀 Expo Native & EAS Guide

Este documento detalla el flujo de trabajo para el desarrollo de aplicaciones móviles con **Expo**, diferenciando entre ejecución local, desarrollo nativo y despliegue a tiendas con costo $0.

---

## 🛠️ Comandos de Desarrollo Diario

### 1. Desarrollo Local con Hot Reload
Ideal para trabajar en la lógica de negocio (CRUD) y diseño.

* `npx expo start`: Inicia el servidor Metro. Si usas **Expo Go**, permite ver cambios instantáneos.
* `npx expo run:android` / `npx expo run:ios`: 
    * **¿Qué hace?** Ejecuta el `prebuild`, genera las carpetas nativas (`/android`, `/ios`) y compila la app en modo **Debug**.
    * **Hot Reload:** Sí, mantiene el enlace con tu PC para reflejar cambios al instante.
    * **Uso:** Cuando necesitas probar librerías nativas que Expo Go no soporta.

---

## 📦 Gestión de Compilaciones (Builds)

### 2. Generación Local (Costo $0)
Para generar el archivo final sin gastar créditos de la nube de Expo. Requiere tener configurado Android Studio/Xcode localmente.

* `eas build --platform android --profile production --local`: 
    * **¿Qué hace?** Compila el binario (`.aab` para Android) usando el procesador de tu PC.
    * **Resultado:** Un archivo listo para subir manualmente a Google Play Console.
    * **Ventaja:** Ilimitado y gratuito.

### 3. Generación en la Nube (EAS Build)
* `eas build --platform android --profile production`:
    * **¿Qué hace?** Sube tu código a los servidores de Expo para que ellos lo compilen.
    * **Uso:** Obligatorio para generar apps de iOS si no tienes Mac, o si tu PC local falla al compilar.

---

## ⚡ Actualizaciones por el Aire (OTA Updates)

### 4. EAS Update
Permite corregir errores en producción sin que el usuario tenga que descargar una nueva versión de la tienda.

* `npx expo install expo-updates`: Instala el módulo necesario para que la app "escuche" actualizaciones.
* `eas update --branch production --message "Descripción del cambio"`:
    * **¿Qué hace?** Envía tu código JavaScript actualizado a los servidores de Expo.
    * **Efecto:** Los usuarios reciben la mejora automáticamente al abrir la app.
    * **Restricción:** Solo funciona para cambios en JS/Assets; cambios nativos requieren un nuevo Build Local.

---

## 🔄 Resumen de Flujo de Trabajo

| Acción | Comando Recomendado | Modo | ¿Costo? |
| :--- | :--- | :--- | :--- |
| **Programar lógica/UI** | `npx expo start` | Desarrollo | $0 |
| **Probar nueva lib nativa** | `npx expo run:android` | Debug Nativo | $0 |
| **Crear App para Tienda** | `eas build --local` | Producción | $0 |
| **Corregir bug en tienda** | `eas update` | OTA Update | Gratis (Plan Free) |

---

> **⚠️ Nota importante:** > El comando `npx expo prebuild` se ejecuta automáticamente por debajo cuando usas los comandos `run`. Solo úsalo manualmente si necesitas editar archivos en `/android` o `/ios` antes de compilar.