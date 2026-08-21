import { z } from 'zod';

import { registry } from '@/documentation/registry';
import { ErrorResponseSchema, PaginationMetaSchema } from '@/documentation/responses/common';

const UUID = z.string().uuid();
const ResourceSchema = z.object({ id: UUID });
const CollectionSchema = z.object({ data: z.array(ResourceSchema), meta: PaginationMetaSchema });
const DataSchema = z.object({ data: ResourceSchema });
const ErrorSchema = { 'application/json': { schema: ErrorResponseSchema } };
const security = [{ cookieAuth: [] }];

registry.register('BibliaKidsResource', ResourceSchema);
registry.register('BibliaKidsCollection', CollectionSchema);

const registerCollection = (path: string, tag: string): void => {
	registry.registerPath({
		method: 'get',
		path,
		tags: [tag],
		security,
		responses: {
			200: {
				description: `Listado de ${tag.toLowerCase()}`,
				content: { 'application/json': { schema: CollectionSchema } },
			},
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
		},
	});
	registry.registerPath({
		method: 'post',
		path,
		tags: [tag],
		security,
		request: {
			body: { required: true, content: { 'application/json': { schema: ResourceSchema } } },
		},
		responses: {
			201: {
				description: `${tag} creado`,
				content: { 'application/json': { schema: DataSchema } },
			},
			400: { description: 'Entrada inválida', content: ErrorSchema },
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
		},
	});
};

const registerItem = (path: string, tag: string): void => {
	registry.registerPath({
		method: 'get',
		path,
		tags: [tag],
		security,
		responses: {
			200: { description: tag, content: { 'application/json': { schema: DataSchema } } },
			401: { description: 'No autenticado', content: ErrorSchema },
			404: { description: 'No encontrado', content: ErrorSchema },
		},
	});
	registry.registerPath({
		method: 'patch',
		path,
		tags: [tag],
		security,
		request: {
			body: { required: true, content: { 'application/json': { schema: ResourceSchema } } },
		},
		responses: {
			200: {
				description: `${tag} actualizado`,
				content: { 'application/json': { schema: DataSchema } },
			},
			400: { description: 'Entrada inválida', content: ErrorSchema },
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
			404: { description: 'No encontrado', content: ErrorSchema },
		},
	});
	registry.registerPath({
		method: 'delete',
		path,
		tags: [tag],
		security,
		responses: {
			204: { description: `${tag} eliminado` },
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
			404: { description: 'No encontrado', content: ErrorSchema },
		},
	});
};

for (const [path, tag] of [
	['/usuarios', 'Usuarios'],
	['/historias', 'Historias'],
	['/niveles', 'Niveles'],
	['/juegos', 'Juegos'],
	['/planes-lectura', 'Planes de lectura'],
] as const) {
	registerCollection(path, tag);
}

for (const [path, tag] of [
	['/usuarios/{usuarioId}', 'Usuarios'],
	['/historias/{historiaId}', 'Historias'],
	['/niveles/{nivelId}', 'Niveles'],
	['/juegos/{juegoId}', 'Juegos'],
	['/planes-lectura/{planId}', 'Planes de lectura'],
] as const) {
	registerItem(path, tag);
}

for (const [path, tag] of [
	['/libros', 'Libros'],
	['/libros/{libroId}', 'Libros'],
	['/libros/{libroId}/capitulos', 'Capítulos'],
	['/libros/{libroId}/capitulos/{capituloId}', 'Capítulos'],
	['/capitulos/{capituloId}/versiculos', 'Versículos'],
	['/capitulos/{capituloId}/versiculos/{versiculoId}', 'Versículos'],
	['/usuarios/{usuarioId}/progresos', 'Progresos'],
	['/usuarios/{usuarioId}/progresos/{progresoId}', 'Progresos'],
	['/usuarios/{usuarioId}/favoritos', 'Favoritos'],
	['/usuarios/{usuarioId}/favoritos/{favoritoId}', 'Favoritos'],
] as const) {
	registry.registerPath({
		method: 'get',
		path,
		tags: [tag],
		security,
		responses: {
			200: {
				description: tag,
				content: {
					'application/json': { schema: path.endsWith('}') ? DataSchema : CollectionSchema },
				},
			},
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
		},
	});
}

registry.registerPath({
	method: 'post',
	path: '/usuarios/{usuarioId}/progresos',
	tags: ['Progresos'],
	security,
	request: {
		body: { required: true, content: { 'application/json': { schema: ResourceSchema } } },
	},
	responses: {
		201: {
			description: 'Progreso registrado',
			content: { 'application/json': { schema: DataSchema } },
		},
		400: { description: 'Entrada inválida', content: ErrorSchema },
		401: { description: 'No autenticado', content: ErrorSchema },
		403: { description: 'Sin permisos', content: ErrorSchema },
	},
});
registry.registerPath({
	method: 'post',
	path: '/usuarios/{usuarioId}/favoritos',
	tags: ['Favoritos'],
	security,
	request: {
		body: { required: true, content: { 'application/json': { schema: ResourceSchema } } },
	},
	responses: {
		201: {
			description: 'Favorito agregado',
			content: { 'application/json': { schema: DataSchema } },
		},
		400: { description: 'Entrada inválida', content: ErrorSchema },
		401: { description: 'No autenticado', content: ErrorSchema },
		403: { description: 'Sin permisos', content: ErrorSchema },
	},
});

registry.registerPath({
	method: 'patch',
	path: '/usuarios/{usuarioId}/progresos/{progresoId}',
	tags: ['Progresos'],
	security,
	request: {
		body: { required: true, content: { 'application/json': { schema: ResourceSchema } } },
	},
	responses: {
		200: {
			description: 'Progreso actualizado',
			content: { 'application/json': { schema: DataSchema } },
		},
		400: { description: 'Entrada inválida', content: ErrorSchema },
		401: { description: 'No autenticado', content: ErrorSchema },
		403: { description: 'Sin permisos', content: ErrorSchema },
	},
});

for (const [path, tag] of [
	['/usuarios/{usuarioId}/progresos/{progresoId}', 'Progresos'],
	['/usuarios/{usuarioId}/favoritos/{favoritoId}', 'Favoritos'],
] as const) {
	registry.registerPath({
		method: 'delete',
		path,
		tags: [tag],
		security,
		responses: {
			204: { description: `${tag} eliminado` },
			401: { description: 'No autenticado', content: ErrorSchema },
			403: { description: 'Sin permisos', content: ErrorSchema },
		},
	});
}
