TFI - "Mi Ciudad" | Documentación del Proyecto y Despliegue en Producción

Este repositorio contiene la arquitectura backend y frontend del Trabajo Final Integrador (TFI) "Mi Ciudad"


 Endpoints y Servicios en Producción

URL Base de la API (Render): https://api-mi-ciudad-95x9.onrender.com

Documentación / Endpoints Principales:

/lugares: Listado general de puntos de interés y geolocalización.

/categorias: Gestión de clasificaciones turísticas/municipales.

/auth & /perfil: Autenticación de usuarios mediante tokens y gestión de perfiles.

 Configuración y Despliegue

1. Backend (Render & Supabase)

El despliegue del backend se realiza de manera automatizada conectando el repositorio de GitHub con Render utilizando un archivo Dockerfile. Las siguientes variables de entorno son requeridas obligatoriamente en el panel de Render:

PORT=3000
DB_URL=postgresql://[usuario]:[password]@[host]:5432/postgres
SUPABASE_PROYECTO=[id_proyecto]
S3_REGION=us-west-2
S3_BUCKET=archivos
S3_ACCESS_KEY_ID=[s3_access_key]
S3_SECRET_ACCESS_KEY=[s3_secret_key]


2. Frontend Móvil

Para conectar la aplicación móvil al backend en producción, se configura la URL base en los servicios de red del cliente:

export const BASE_URL = 'https://api-mi-ciudad-95x9.onrender.com';


Para compilar una nueva versión nativa (APK) apuntando a la nube:

eas build --platform android --profile preview


