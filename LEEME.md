# Sincronización de GitHub Wiki para Obsidian

[![Build and Test](https://github.com/ErnestoCobos/obsidian-wiki-sync/actions/workflows/build-test.yml/badge.svg)](https://github.com/ErnestoCobos/obsidian-wiki-sync/actions/workflows/build-test.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ErnestoCobos/obsidian-wiki-sync)](https://github.com/ErnestoCobos/obsidian-wiki-sync/releases/latest)
[![GitHub license](https://img.shields.io/github/license/ErnestoCobos/obsidian-wiki-sync)](https://github.com/ErnestoCobos/obsidian-wiki-sync/blob/main/LICENSE)
[![Code Coverage](https://raw.githubusercontent.com/ErnestoCobos/obsidian-wiki-sync/main/coverage/badge.svg)](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync)
[![codecov](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync/branch/main/graph/badge.svg)](https://codecov.io/gh/ErnestoCobos/obsidian-wiki-sync)

Este plugin te permite sincronizar tu bóveda de Obsidian con repositorios de GitHub Wiki. Proporciona sincronización bidireccional entre tus notas locales de Obsidian y un Wiki de GitHub, facilitando la colaboración con otros o el mantenimiento de documentación usando Obsidian.

## Repositorio

El código fuente de este plugin está disponible en GitHub:
https://github.com/ErnestoCobos/obsidian-wiki-sync

## Características

- Sincronización bidireccional entre Obsidian y GitHub Wiki
- Sincronización automática al guardar archivos (opcional)
- Sincronización periódica en segundo plano (intervalo configurable)
- Comandos de sincronización manual (sincronizar, solo descargar, solo subir)
- Indicadores visuales del estado de sincronización
- Carpeta local configurable para archivos wiki

## Instalación

### Desde Plugins Comunitarios de Obsidian

1. Abre la Configuración de Obsidian
2. Ve a "Plugins de la comunidad" y desactiva el Modo Seguro
3. Haz clic en "Explorar" y busca "GitHub Wiki Sync"
4. Instala el plugin y actívalo

### Instalación Manual

1. Descarga la última versión (`main.js`, `manifest.json`, `styles.css`)
2. Crea una carpeta llamada `github-wiki-sync` en el directorio `.obsidian/plugins/` de tu bóveda
3. Copia los archivos descargados en esa carpeta
4. Reinicia Obsidian y activa el plugin en Configuración > Plugins de la comunidad

## Configuración

Antes de usar el plugin, necesitas configurarlo en la Configuración:

1. **Token de GitHub**: Un token de acceso personal con permisos de `repo`. Puedes generar uno desde tu [Configuración de Desarrollador de GitHub](https://github.com/settings/tokens).
2. **Nombre de usuario de GitHub**: Tu nombre de usuario de GitHub.
3. **Nombre del Repositorio**: El nombre del repositorio que contiene el wiki (sin la parte `.wiki`).
4. **Ruta de la Carpeta Wiki**: (Opcional) La carpeta en tu bóveda donde se almacenarán los archivos wiki. Déjala vacía para usar la raíz de tu bóveda.
5. **Sincronizar al Guardar**: Activa para habilitar la subida automática a GitHub cuando se guardan archivos.
6. **Intervalo de Sincronización Automática**: Establece cada cuánto tiempo (en minutos) el plugin debe sincronizarse automáticamente con GitHub. Establece 0 para desactivar.

## Uso

Una vez configurado, puedes usar el plugin de varias formas:

### Sincronización Manual

- Haz clic en el icono de actualización en la cinta izquierda para realizar una sincronización completa
- Usa la paleta de comandos y busca "GitHub Wiki: Sincronizar con GitHub Wiki"
- Usa el botón "Sincronizar Ahora" en la configuración del plugin

### Solo Descargar Cambios

Para descargar cambios desde GitHub Wiki sin subir tus cambios locales:

- Usa la paleta de comandos y busca "GitHub Wiki: Descargar desde GitHub Wiki"

### Solo Subir Cambios

Para subir tus cambios locales a GitHub Wiki sin descargar primero:

- Usa la paleta de comandos y busca "GitHub Wiki: Subir a GitHub Wiki"

### Sincronización Automática

Si has activado "Sincronizar al Guardar" o has establecido un intervalo de sincronización automática, el plugin se sincronizará automáticamente según tu configuración.

## Manejo de Nombres de Archivo

El plugin maneja las convenciones de nombres de archivos entre Obsidian y GitHub Wiki:

- Archivo de Obsidian: `mi-nota.md`
- Página de GitHub Wiki: `mi-nota`

Los caracteres especiales y espacios en los nombres de archivo se conservan en ambas direcciones.

## Indicadores de Estado

- La barra de estado muestra el estado actual de sincronización y la hora de la última sincronización
- Un indicador visual aparece durante las operaciones de sincronización
- Las notificaciones muestran mensajes de éxito o error después de las operaciones de sincronización

## Mejorando la Documentación con Herramientas Externas

Puedes mejorar tu documentación wiki integrándola con herramientas externas:

### Usando Context7 para Análisis de Documentación

[Context7](https://context7.com) es una herramienta que puede ayudar a analizar y mejorar tu documentación. Al integrarte con Context7, puedes:

- Analizar automáticamente el contenido de tu wiki para verificar su exhaustividad
- Obtener sugerencias para mejorar la claridad de la documentación
- Hacer seguimiento de la cobertura de documentación para tu proyecto
- Identificar brechas en la documentación

Para usar Context7 con este plugin:

1. Sincroniza tus notas de Obsidian con GitHub Wiki usando este plugin
2. Conecta tu repositorio de GitHub a Context7
3. Usa los análisis de Context7 para mejorar tu documentación

### Usando Perplexity para Investigación y Creación de Contenido

[Perplexity](https://www.perplexity.ai) es un asistente de investigación con IA que puede ayudar con la creación de documentación. Se puede usar junto con este plugin para:

- Investigar temas técnicos a incluir en tu documentación
- Responder preguntas sobre las tecnologías que usa tu proyecto
- Generar borradores iniciales de documentación
- Encontrar fuentes relevantes para citar en tu wiki

Flujo de trabajo con Perplexity:

1. Usa Perplexity para investigar temas para tu documentación
2. Crea o edita notas en Obsidian basadas en los hallazgos de la investigación
3. Usa este plugin para sincronizar tu documentación mejorada con GitHub Wiki
4. Mantén la documentación actualizada repitiendo este proceso

## Desarrollo

Para compilar el plugin para desarrollo:

1. Clona el repositorio
2. Ejecuta `npm install` para instalar dependencias
3. Ejecuta `npm run dev` para iniciar el proceso de compilación de desarrollo
4. Copia los archivos compilados a tu directorio `.obsidian/plugins/github-wiki-sync/`

### Pruebas

Este plugin incluye un conjunto completo de pruebas utilizando Jest. Las pruebas están organizadas en varias categorías:

- **Pruebas Unitarias**: Prueban componentes y funciones individuales
- **Pruebas de Integración**: Prueban cómo los componentes trabajan juntos
- **Pruebas de Componentes**: Se centran en componentes específicos del plugin como la API de GitHub
- **Pruebas de Rendimiento**: Miden la eficiencia de sincronización con repositorios grandes

#### Ejecutando Pruebas

Puedes ejecutar diferentes conjuntos de pruebas con estos comandos npm:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo observación durante el desarrollo
npm run test:watch

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar solo pruebas de componentes
npm run test:components

# Ejecutar pruebas de rendimiento
npm run test:performance

# Generar informe de cobertura de pruebas
npm run test:coverage
```

O utiliza el script de prueba incluido para obtener una mejor salida visual:

```bash
# Ejecutar todas las pruebas secuencialmente con salida colorizada
./run-tests.sh

# Ejecutar un conjunto específico de pruebas
./run-tests.sh unit
./run-tests.sh integration
./run-tests.sh components
./run-tests.sh performance
./run-tests.sh coverage
```

#### Cobertura de Pruebas

El conjunto de pruebas busca una alta cobertura de la funcionalidad principal:
- Inicialización y configuración del plugin
- Integración con la API de GitHub
- Funcionalidad de sincronización (descarga, subida y sincronización completa)
- Manejo de errores y casos extremos
- Gestión de configuraciones
- Conversión de rutas

#### Pruebas de Integración

Las pruebas de integración verifican que el plugin:
- Sincronice correctamente el contenido entre Obsidian y GitHub Wiki
- Maneje correctamente los conflictos
- Realice sincronizaciones diferenciales eficientes (solo archivos modificados)
- Gestione correctamente las rutas de archivos entre sistemas

#### Pruebas de Rendimiento

Las pruebas de rendimiento aseguran que el plugin siga siendo eficiente con:
- Repositorios grandes (más de 100 páginas wiki)
- Operaciones de sincronización frecuentes
- Diferentes estrategias de sincronización

Cuando contribuyas, por favor asegúrate de que tus cambios estén cubiertos por pruebas apropiadas.

## GitHub Actions

Este proyecto utiliza GitHub Actions para automatizar las pruebas y los lanzamientos:

### Integración Continua

El flujo de trabajo `build-test.yml` se ejecuta en cada push a la rama principal y en cada pull request:

- Compila el plugin con múltiples versiones de Node.js
- Ejecuta todas las pruebas para asegurar la calidad del código
- Sube los artefactos de compilación para verificación

### Lanzamientos Automatizados

El flujo de trabajo `release.yml` se activa cuando se hace push de una nueva etiqueta:

1. Compila y prueba el plugin
2. Crea un lanzamiento de GitHub con los archivos apropiados
3. Adjunta los archivos compilados como activos del lanzamiento

### Creando un Nuevo Lanzamiento

Para crear un nuevo lanzamiento:

```bash
# Actualizar versión en package.json y manifest.json
npm version patch  # o minor, o major

# Hacer push de los cambios incluyendo la nueva etiqueta
git push --follow-tags
```

El flujo de trabajo de GitHub Actions creará automáticamente un nuevo lanzamiento con los archivos compilados.

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, consulta nuestras [guías de contribución](CONTRIBUIR.md) para comenzar.

Damos la bienvenida a contribuciones en diferentes áreas:

- Mejoras de código y corrección de errores
- Mejoras en la documentación
- Traducciones
- Cobertura de pruebas

Si estás interesado en contribuir código, por favor asegúrate de que tu código tenga una cobertura de pruebas adecuada.

## Licencia

Licencia MIT

## Agradecimientos

Este plugin fue inspirado por la necesidad de colaborar en documentación entre usuarios de Obsidian y colaboradores de GitHub.

## Soporte

Si encuentras algún problema o tienes solicitudes de funciones, por favor abre un issue en el repositorio de GitHub.