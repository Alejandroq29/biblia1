import { prisma } from '@/database/client';

/**
 * Roles base del dominio Biblia Kids.
 */
type RoleSeed = {
	name: string;
	description: string;
};

const ROLES: RoleSeed[] = [
	{
		name: 'Estudiante',
		description: 'Estudiante de Biblia Kids. Acceso a lectura, juegos y progreso.',
	},
	{
		name: 'Administrador',
		description: 'Administra la plataforma completa Biblia Kids.',
	},
	{
		name: 'Docente',
		description: 'Gestiona historias, niveles y hace seguimiento de progreso.',
	},
];

const toCode = (name: string): string => name.toLowerCase().replace(/\s+/gu, '-');

const main = async (): Promise<void> => {
	console.log('🌱 Sembrando roles base Biblia Kids...\n');

	for (const role of ROLES) {
		const existing = await prisma.role.findFirst({
			where: { name: role.name, deletedAt: null },
		});

		if (existing) {
			console.log(`⏭️  Ya existe: ${role.name} (${existing.id})`);
			continue;
		}

		const created = await prisma.role.create({
			data: {
				name: role.name,
				code: toCode(role.name),
				description: role.description,
				isSystem: true,
			},
		});

		console.log(`✅ Creado: ${role.name} (${created.id})`);
	}

	console.log('\n✅ Roles base listos.');

	await grantAllPermissionsToAdmin();
};

/**
 * El rol Administrador administra la plataforma completa, así que recibe TODOS
 * los permisos del catálogo (los crea `yarn seed`).
 */
const grantAllPermissionsToAdmin = async (): Promise<void> => {
	const admin = await prisma.role.findFirst({
		where: { code: 'administrador', deletedAt: null },
	});

	if (!admin) {
		console.log('⏭️  No existe el rol Administrador; nada que otorgar.');
		return;
	}

	const permissions = await prisma.permission.findMany({ select: { id: true, code: true } });

	if (permissions.length === 0) {
		console.log('⚠️  El catálogo de permisos está vacío. Corre `yarn seed` primero.');
		return;
	}

	for (const permission of permissions) {
		await prisma.rolePermission.upsert({
			where: { roleId_permissionId: { roleId: admin.id, permissionId: permission.id } },
			create: { roleId: admin.id, permissionId: permission.id },
			update: { granted: true },
		});
	}

	console.log(`🔑 Administrador ahora tiene ${permissions.length} permisos.`);
};

main()
	.catch((error: unknown) => {
		console.error('❌ Error en seed-dev:', error instanceof Error ? error.message : error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
