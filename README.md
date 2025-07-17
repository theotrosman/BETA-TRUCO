# Truco Roguelike - Sistema de Estadísticas Mejorado
[Sitio WEB de TEST](https://theotrosman.github.io/TRUKEADOS/)

## 🎯 Descripción

Este proyecto es un juego de Truco Argentino con elementos roguelike y un sistema de estadísticas completo y sincronizado con Firebase.

## ✨ Características Principales

### 🎮 Juego
- **Truco Argentino clásico** con reglas completas
- **Modo Roguelike** con elementos progresivos
- **Sistema de comodines** con efectos especiales
- **IA adaptativa** que mejora con el tiempo

### 📊 Sistema de Estadísticas
- **Sincronización en tiempo real** con Firebase
- **Estadísticas detalladas** de partidas, victorias, chicos, envidos, trucos
- **Seguimiento de cartas** más jugadas y efectivas
- **Sistema de logros** desbloqueables
- **Niveles de jugador** basados en rendimiento
- **Historial de partidas** completo

### 🎨 Interfaz Mejorada
- **Diseño moderno** con gradientes y animaciones
- **Colores consistentes** (verde/azul)
- **Responsive design** para móviles y desktop
- **Animaciones suaves** y efectos hover
- **Barras de progreso** visuales

## 🚀 Cómo Usar

### 1. Configuración Inicial
```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Abrir en el navegador
# Asegúrate de tener configurado Firebase
```

### 2ugar
- **Truco Vanilla**: Modo clásico sin elementos roguelike
- **Truco Roguelike**: Modo con comodines y progresión
- **Perfil**: Ver estadísticas y logros

###3 Estadísticas
- **Pestaña Estadísticas**: Resumen general del rendimiento
- **Pestaña Cartas**: Análisis de cartas más jugadas
- **Pestaña Comodines**: Comodines desbloqueados y usados
- **Pestaña Logros**: Logros conseguidos

## 🔧 Archivos Principales

### Frontend
- `index.html` - Página principal
- `truco-roguelike.html` - Juego principal
- `trucovanilla.html` - Modo clásico
- `perfil.html` - Sistema de estadísticas
- `test-stats.html` - Página de pruebas

### JavaScript
- `main.js` - Lógica principal del juego
- `perfil.js` - Sistema de estadísticas
- `auth.js` - Autenticación con Firebase
- `stats-config.js` - Configuración de estadísticas

### Estilos
- `styles.css` - Estilos principales
- `mazo-selector.css` - Estilos del selector de mazos

## 📊 Sistema de Estadísticas

### Estadísticas Rastreadas
- **Partidas jugadas** y ganadas
- **Chicos, envidos, trucos** ganados
- **Flores cantadas**
- **Tiempo promedio** por turno
- **Comodines usados**
- **Cartas más jugadas** y efectivas

### Niveles de Jugador1. **Novato** (0puntos)2. **Principiante** (100-299puntos)3. **Intermedio** (300-599puntos)4 **Avanzado** (600-999puntos)
5. **Experto** (1001999ntos)
6. **Maestro** (2003999untos)7. **Legendario** (4007999untos)
8. **Mítico** (8000+ puntos)

### Logros Disponibles
- Primera victoria
- Rachas ganadoras
- Maestro de cartas
- Estratega (70+ victorias)
- Rápido como el viento
- Y muchos más...

## 🎭 Comodines

### Comodines Básicos
- **Palo Único**: Solo cartas de un palo
- **Desempate Criollo**: Ganar empates
- **Mate Cocido**: Fusionar cartas iguales
- **Flor Falsa**: Declarar flor con 3el mismo palo

### Comodines Avanzados
- **Dominio Ilusorio**: Cambiar palos temporalmente
- **Triple Milagro**: Destruir cartas por poderosas
- **Gaucho Invisible**: Ocultar jugadas
- **Y muchos más...**

## 🔥 Características Técnicas

### Firebase Integration
- **Autenticación** con email/password
- **Firestore** para estadísticas
- **Sincronización automática**
- **Respaldo de datos**

### Performance
- **Carga asíncrona** de estadísticas
- **Guardado automático** cada 30 segundos
- **Validación de datos** integrada
- **Manejo de errores** robusto

### UX/UI
- **Animaciones CSS** suaves
- **Feedback visual** inmediato
- **Diseño responsive**
- **Accesibilidad** mejorada

## 🐛 Solución de Problemas

### Estadísticas no aparecen
1Verificar conexión a Firebase2. Revisar autenticación del usuario
3. Usar `test-stats.html` para diagnosticar

### Datos no se guardan
1. Verificar permisos de Firestore
2. Revisar configuración de Firebase
3Verificar conexión a internet

### Errores de carga
1. Limpiar caché del navegador2Verificar archivos JavaScript
3evisar consola del navegador

## 📝 Changelog

### v2.0 - Sistema de Estadísticas Mejorado
- ✅ **Estadísticas sincronizadas** con Firebase
- ✅ **Interfaz moderna** con colores consistentes
- ✅ **Sistema de niveles** mejorado
- ✅ **Logros desbloqueables**
- ✅ **Barras de progreso** visuales
- ✅ **Animaciones y efectos** mejorados
- ✅ **Página de pruebas** para debugging
- ✅ **Manejo de errores** robusto

### v1.0- Versión Base
- Juego de Truco funcional
- Sistema básico de estadísticas
- Comodines básicos

## 🤝 Contribuir

1. Fork el proyecto2rear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Comunidad de Truco Argentino
- Firebase por la infraestructura
- Contribuidores del proyecto

---

**¡Disfruta jugando Truco Roguelike! 🎴**

