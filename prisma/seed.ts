import { prisma } from '@/database/client';

const PERMISSIONS = [
	{ module: 'usuarios', action: 'read', description: 'Leer usuarios' },
	{ module: 'usuarios', action: 'manage', description: 'Gestionar usuarios y roles' },
	{ module: 'roles', action: 'read', description: 'Leer roles' },
	{ module: 'roles', action: 'manage', description: 'Gestionar roles' },
	{ module: 'permisos', action: 'read', description: 'Leer permisos' },
	{ module: 'historias', action: 'read', description: 'Leer historias bíblicas' },
	{ module: 'historias', action: 'manage', description: 'Gestionar historias bíblicas' },
	{ module: 'niveles', action: 'read', description: 'Leer niveles educativos' },
	{ module: 'niveles', action: 'manage', description: 'Gestionar niveles educativos' },
	{ module: 'juegos', action: 'read', description: 'Leer juegos educativos' },
	{ module: 'juegos', action: 'manage', description: 'Gestionar juegos educativos' },
	{ module: 'progresos', action: 'read', description: 'Leer progresos educativos' },
	{ module: 'progresos', action: 'manage', description: 'Registrar progresos educativos' },
	{ module: 'libros', action: 'read', description: 'Leer recursos bíblicos' },
	{ module: 'favoritos', action: 'manage', description: 'Gestionar favoritos propios' },
	{ module: 'planes-lectura', action: 'read', description: 'Leer planes de lectura' },
	{ module: 'planes-lectura', action: 'manage', description: 'Gestionar planes de lectura' },
];

const main = async (): Promise<void> => {
	for (const permission of PERMISSIONS) {
		const code = `${permission.module}.${permission.action}`;
		await prisma.permission.upsert({
			where: { code },
			create: { ...permission, code },
			update: { description: permission.description },
		});
	}
};

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
