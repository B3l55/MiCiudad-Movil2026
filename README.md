#  Mi Ciudad - Guía Turística de Colón

Trabajo Final Integrador (TFI) - Aplicación móvil diseñada para potenciar la experiencia turística en la ciudad de Colón, Entre Ríos. 

##  Características Principales

**Para el Turista:**
* **Exploración y Filtros:** Búsqueda en tiempo real de puntos de interés.
* **Detalle Interactivo:** Integración de audioguías, mapas interactivos  y contacto directo.
* **Gamificación (Escáner QR):** Lector de códigos QR en puntos turísticos para registrar visitas y guardar recuerdos fotográficos.
* **Personalización:** Gestión de lugares Favoritos y guardado de Eventos en la Agenda personal.
* **Mi Recorrido:** historial de lugares visitados y fotografías.

**Para el Administrador (Municipio):**
* **Gestión de Eventos:**  agenda local con capacidad de suspender o cancelar eventos en tiempo real ante imprevistos.
* **Control de Accesos:** Interfaz adaptable según el rol del usuario (Role-Based Access Control).



##  Aclaración Importante para la Corrección (Entorno Ngrok)

El sistema backend de este proyecto se encuentra configurado para ejecutarse en un entorno local mediante contenedores **Docker**. 

Para permitir la comunicación entre la aplicación móvil (instalada en un dispositivo físico mediante el APK autónomo) y la base de datos local, **el puerto del servidor se expuso a internet utilizando un túnel inverso de Ngrok.**

### Pasos para probar la aplicación en un entorno propio:

Si el equipo  desea levantar el proyecto desde el código fuente y conectar el APK a su propio entorno local, deben seguir estos pasos:

1. Levantar el entorno de backend con Docker y ejecutar su propia instancia de Ngrok (ej: `ngrok http 3000`).
2. En el código fuente del frontend, dirigirse al archivo de  configuración de API (`src/config/api.ts`).
3. Reemplazar la URL base actual por la nueva URL generada por su túnel de Ngrok.
   actualmente es= export const BASE_URL = 'https://usage-excavator-eating.ngrok-free.dev';

   # Ejemplo:
   export const BASE_URL=[https://su-nueva-url.ngrok-free.app/api](https://su-nueva-url.ngrok-free.app/api)