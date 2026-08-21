import { prisma } from '@/database/client';

/**
 * Asigna un rol a un usuario en Biblia Kids.
 *
 *   yarn asignar-rol --email estudiante@biblia1.local --rol estudiante
 */
type Args = {
	email: string;
	rol: string;
};

const parseArgs = (argv: string[]): Args => {
	const values = new Map<string, string>();

	for (let index = 0; index < argv.length; index += 1) {
		const token = argv[index];

		if (!token.startsWith('--')) {
			continue;
		}

		const next = argv[index + 1];

		if (!next || next.startsWith('--')) {
			throw new Error(`Falta el valor para ${token}`);
		}

		values.set(token.slice(2), next);
		index += 1;
	}

	const email = values.get('email');
	const rol = values.get('rol');

	if (!email || !rol) {
		throw new Error('Uso: yarn asignar-rol --email <email> --rol <codigo-del-rol>');
	}

	return {
		email,
		rol,
	};
};

const main = async (): Promise<void> => {
	const args = parseArgs(process.argv.slice(2));

	const user = await prisma.user.findUnique({ where: { email: args.email } });

	if (!user) {
		throw new Error(
			`No existe el usuario ${args.email} en Biblia Kids. Debe iniciar sesión al menos una vez: el callback lo crea automáticamente.`,
		);
	}

	const role = await prisma.role.findFirst({
		where: { code: args.rol, deletedAt: null },
	});

	if (!role) {
		const disponibles = await prisma.role.findMany({
			where: { deletedAt: null },
			select: { code: true },
		});

		throw new Error(
			`No existe el rol '${args.rol}'. Disponibles: ${disponibles.map(r => r.code).join(', ') || '(ninguno, corre yarn seed-dev)'}`,
		);
	}

	const existing = await prisma.userRole.findFirst({
		where: { userId: user.id, roleId: role.id },
	});

	if (existing) {
		console.log(`⏭️  ${args.email} ya tiene el rol '${role.name}'. Nada que hacer.`);
		return;
	}

	await prisma.userRole.create({
		data: { userId: user.id, roleId: role.id },
	});

	console.log(`✅ Rol '${role.name}' asignado a ${args.email}`);
	console.log(
		'\n⚠️  La sesión se cifra en la cookie al iniciar sesión: cierra sesión y vuelve a entrar para que el rol aparezca en /api/auth/session.',
	);
};

main()
	.catch((error: unknown) => {
		console.error('❌', error instanceof Error ? error.message : error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
