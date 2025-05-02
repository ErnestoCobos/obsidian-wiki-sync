# Contribuir a GitHub Wiki Sync

¡Gracias por considerar contribuir al plugin GitHub Wiki Sync para Obsidian! Este documento proporciona pautas e instrucciones para contribuir.

## Configuración de Desarrollo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/yourusername/obsidian-github-wiki-sync.git
   cd obsidian-github-wiki-sync
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Enlaza el plugin a tu bóveda de Obsidian para pruebas:
   - Crea una carpeta en el directorio `.obsidian/plugins` de tu bóveda llamada `github-wiki-sync`
   - Copia o crea un enlace simbólico de los archivos `main.js`, `manifest.json` y `styles.css` a esta carpeta
   - Habilita el plugin en la configuración de Plugins de la Comunidad de Obsidian

## Pruebas

Ejecuta diferentes conjuntos de pruebas usando los scripts npm proporcionados:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar pruebas de integración
npm run test:integration

# Ejecutar pruebas específicas de componentes
npm run test:components

# Ejecutar pruebas de rendimiento
npm run test:performance

# Generar informe de cobertura
npm run test:coverage
```

Alternativamente, usa el script `run-tests.sh` para una salida colorizada:

```bash
./run-tests.sh unit
```

## Estilo de Código y Estándares

- Sigue las mejores prácticas de TypeScript
- Usa nombres significativos para variables y funciones
- Mantén las funciones pequeñas y enfocadas
- Comenta lógica compleja
- Escribe pruebas para nueva funcionalidad

## Proceso de Pull Request

1. Crea una nueva rama para tu característica o corrección de errores
2. Realiza tus cambios con pruebas apropiadas
3. Ejecuta las pruebas para asegurarte de que todo pasa
4. Actualiza la documentación si es necesario
5. Envía un pull request con una descripción clara de los cambios
6. Espera la revisión y aborda cualquier comentario

## Lanzamientos

Los lanzamientos se manejan a través de GitHub Actions cuando se hace push de una nueva etiqueta:

```bash
# Actualizar números de versión
npm version patch  # o minor o major

# Push con etiquetas
git push --follow-tags
```

## Código de Conducta

- Sé respetuoso e inclusivo en todas las interacciones
- Valora diferentes puntos de vista y experiencias
- Acepta la crítica constructiva con gracia
- Enfócate en lo que es mejor para la comunidad y los usuarios
- Muestra empatía hacia otros miembros de la comunidad

## ¿Preguntas?

Si tienes preguntas sobre cómo contribuir, por favor abre un issue o contacta a los mantenedores directamente.

¡Gracias por contribuir a hacer GitHub Wiki Sync mejor para todos!