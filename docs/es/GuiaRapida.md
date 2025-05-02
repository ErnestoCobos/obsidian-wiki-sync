# Guía Rápida: Sincronización de GitHub Wiki para Obsidian

Esta guía rápida te ayudará a configurar y comenzar a usar el plugin GitHub Wiki Sync para Obsidian.

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- [Obsidian](https://obsidian.md/) instalado en tu computadora
- Una cuenta de [GitHub](https://github.com/)
- Un repositorio de GitHub con un wiki habilitado

## Instalación

1. Abre Obsidian y ve a Configuración (icono de engranaje en la parte inferior izquierda)
2. Navega a "Plugins de la comunidad" y desactiva el Modo seguro si está habilitado
3. Haz clic en "Explorar" y busca "GitHub Wiki Sync"
4. Haz clic en "Instalar" y luego en "Habilitar" para activar el plugin

## Configurando el Acceso a GitHub

Para permitir que el plugin acceda a tu repositorio de GitHub, necesitas crear un Token de Acceso Personal (PAT):

1. Ve a [Configuración de Desarrollador de GitHub](https://github.com/settings/tokens)
2. Haz clic en "Generar nuevo token" (clásico)
3. Dale a tu token un nombre descriptivo como "Obsidian GitHub Wiki Sync"
4. En "Seleccionar ámbitos", marca la casilla "repo" para dar acceso a tus repositorios
5. Haz clic en "Generar token"
6. **Importante**: Copia el token generado inmediatamente y almacénalo de forma segura. ¡GitHub solo lo mostrará una vez!

## Configurando el Plugin

1. En Obsidian, ve a Configuración y busca "GitHub Wiki Sync" en la sección de plugins de la comunidad
2. Ingresa la siguiente información:
   - **Token de GitHub**: Pega tu token de acceso personal
   - **Nombre de usuario de GitHub**: Tu nombre de usuario de GitHub
   - **Nombre del Repositorio**: El nombre de tu repositorio (sin la parte .wiki)
   - **Ruta de la Carpeta Wiki**: (Opcional) Si deseas almacenar archivos wiki en una carpeta específica en tu bóveda, ingresa la ruta aquí. Déjala vacía para usar la raíz de tu bóveda.
   - **Sincronizar al Guardar**: Actívalo si deseas que los cambios se sincronicen automáticamente cuando guardes archivos
   - **Intervalo de Sincronización Automática**: Establece con qué frecuencia (en minutos) deseas que ocurra la sincronización automática. Establece 0 para desactivar.

## Sincronización Inicial

Una vez configurado, puedes realizar tu primera sincronización:

1. Haz clic en el icono de sincronización en la cinta izquierda (parece un icono de actualización)
2. Observa la barra de estado para obtener información sobre el progreso
3. Después de completarse, deberías ver una notificación que muestra cuántas páginas se actualizaron

## Consejos de Flujo de Trabajo

### Flujo de Trabajo Recomendado

1. **Descargar Primero**: Antes de hacer cambios importantes, descarga los últimos cambios de GitHub Wiki primero
2. **Hacer Cambios**: Edita tus notas en Obsidian
3. **Subir Cambios**: Usa el botón de sincronización para enviar tus cambios de vuelta a GitHub Wiki
4. **Verificar Estado**: Mira la barra de estado para confirmar la sincronización exitosa

### Trabajando con Equipos

Cuando colaboras con otros:

1. Sincroniza frecuentemente para evitar conflictos de fusión
2. Considera usar una carpeta dedicada para el contenido wiki para mantenerlo organizado
3. Comunícate con los miembros del equipo sobre cuándo estás haciendo cambios sustanciales

### Solución de Problemas

Si encuentras problemas:

1. Verifica que tu token de GitHub tenga los permisos correctos
2. Verifica que tu nombre de usuario y nombre de repositorio sean correctos
3. Mira la consola (Ctrl+Shift+I en Obsidian) para ver mensajes de error
4. Intenta desactivar y volver a activar el plugin

## Usando Context7 y Perplexity

### Mejorando la Documentación con Context7

1. Sincroniza tus notas de Obsidian con GitHub Wiki usando este plugin
2. Regístrate en [Context7](https://context7.com) y conecta tu repositorio de GitHub
3. Usa los análisis de Context7 para identificar áreas donde la documentación puede mejorarse
4. Realiza esas mejoras en Obsidian y sincroniza nuevamente

### Investigando con Perplexity

1. Cuando necesites agregar nueva documentación, usa [Perplexity](https://www.perplexity.ai) para investigar el tema
2. Crea una nueva nota en Obsidian con los hallazgos de la investigación
3. Formatea tu nota de acuerdo con tus estándares de documentación
4. Sincroniza la nueva nota con tu GitHub Wiki

## Próximos Pasos

- Personaliza la estructura de organización de tu wiki
- Configura plantillas para documentación consistente
- Crea una página de índice para ayudar a navegar por tu wiki
- Usa enlaces de Obsidian para crear conexiones entre páginas wiki

Para información más detallada, consulta el archivo [LEEME](../../LEEME.md) principal.