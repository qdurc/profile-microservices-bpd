# Profile Microservices

Prueba tecnica desarrollada con NestJS, TypeScript, MongoDB, Docker y Kubernetes.

La solucion separa la consulta de perfiles de la gestion CRUD:

- `profile-query`: recibe `GET /get-profile/:id`.
- `profile-crud`: crea, consulta, actualiza y elimina perfiles en MongoDB.

La comunicacion usa Basic Auth, Key Pair con firma HMAC y token de perfil para operaciones sensibles.

## Como correrlo

```bash
cp .env.example .env
docker compose up --build
```

Servicios locales:

- `profile-query`: `http://localhost:3000`
- `profile-crud`: `http://localhost:3001`
- `mongo`: `localhost:27017`

Para dejarlo corriendo en segundo plano:

```bash
docker compose up -d
```

Para detenerlo:

```bash
docker compose down
```

## Endpoints

| Servicio | Metodo | Endpoint | Uso |
| --- | --- | --- | --- |
| `profile-query` | GET | `/get-profile/:id` | Consulta publica del perfil |
| `profile-crud` | POST | `/create-profile` | Crear perfil |
| `profile-crud` | GET | `/profiles/:id` | Consulta interna |
| `profile-crud` | PUT | `/update-profile/:id` | Actualizar perfil |
| `profile-crud` | DELETE | `/delete-profile/:id` | Eliminar perfil |

## Seguridad

- `POST`, `PUT`, `DELETE` y `GET /get-profile/:id` usan Basic Auth.
- Todos los endpoints protegidos usan headers de Key Pair:
  - `x-key-id`
  - `x-key-timestamp`
  - `x-key-signature`
- `PUT` y `DELETE` tambien requieren `x-profile-token`, que se genera al crear el perfil.
- Si se configuran `TLS_CERT_PATH` y `TLS_KEY_PATH`, los servicios levantan HTTPS con minimo TLS 1.2.

## Postman

La coleccion esta lista para importar:

- `postman/Profile Microservices.postman_collection.json`
- `postman/Profile Microservices Local.postman_environment.json`
- `postman/Profile Microservices Production Template.postman_environment.json`

Para pruebas locales, importa la coleccion y el environment `Profile Microservices Local`.
Ese environment usa credenciales de demo sincronizadas con `.env.example`.

Para produccion, usa `Profile Microservices Production Template` y completa los valores
reales desde tu gestor de secretos o desde las credenciales del ambiente. Los valores
del environment local son solo para correr la prueba tecnica.

Ejecuta primero:

```text
MS #2 - Create Profile
```

Ese request guarda automaticamente `profileId` y `profileToken` para los siguientes requests.

## Kubernetes

Los manifiestos estan en `k8s/`.
Antes de aplicar `k8s/secret.yaml`, reemplaza todos los valores `REPLACE_WITH_*`
por secretos reales del ambiente.

Orden sugerido:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/profile-crud.yaml
kubectl apply -f k8s/profile-query.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/ingress-tls.yaml
```

Antes de usarlo en un ambiente real, cambia los secretos y reemplaza las imagenes `latest` por imagenes publicadas en tu registry.
