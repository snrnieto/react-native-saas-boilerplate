/**
 * EJEMPLO: Cómo usar los tipos generados por Prisma en tu proyecto
 * 
 * IMPORTANTE: Este archivo es solo de referencia.
 * Los tipos de Prisma se usan ÚNICAMENTE para type safety en TypeScript.
 * NO uses PrismaClient directamente en React Native - usa Supabase SDK para las queries.
 */

import type { Account, Session, User } from '@prisma/client';

// ============================================
// EJEMPLO 1: Tipos básicos
// ============================================

// Tipo completo del usuario
type UserType = User;

// Usuario sin campos sensibles (para enviar al frontend)
type PublicUser = Omit<User, 'passwordHash'>;

// Datos para crear un nuevo usuario
type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================
// EJEMPLO 2: Tipos con relaciones
// ============================================

// Usuario con sus sesiones
type UserWithSessions = User & {
    sessions: Session[];
};

// Usuario con sus cuentas OAuth
type UserWithAccounts = User & {
    accounts: Account[];
};

// Usuario completo con todas las relaciones
type UserComplete = User & {
    sessions: Session[];
    accounts: Account[];
};

// ============================================
// EJEMPLO 3: Uso en funciones
// ============================================

/**
 * Ejemplo de función que usa los tipos de Prisma
 * En la práctica, esta función usaría Supabase SDK para la query
 */
async function getUserById(userId: string): Promise<PublicUser | null> {
    // Aquí usarías Supabase SDK, no PrismaClient
    // const { data } = await supabase.from('users').select('*').eq('id', userId).single();

    // Los tipos aseguran que el objeto retornado tenga la estructura correcta
    return null; // placeholder
}

/**
 * Ejemplo de función para crear usuario
 */
async function createUser(userData: CreateUserData): Promise<User> {
    // Aquí usarías Supabase SDK
    // const { data } = await supabase.from('users').insert(userData).select().single();

    return {} as User; // placeholder
}

/**
 * Ejemplo de función que retorna datos públicos del usuario
 */
function toPublicUser(user: User): PublicUser {
    const { passwordHash, ...publicData } = user;
    return publicData;
}

// ============================================
// EJEMPLO 4: Uso en React Native (Context/Hooks)
// ============================================

/**
 * Ejemplo de cómo usarías estos tipos en un Context de Auth
 */
interface AuthContextType {
    user: PublicUser | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// ============================================
// RESUMEN
// ============================================

/**
 * FLUJO DE TRABAJO:
 * 
 * 1. Defines tu schema en prisma/schema.prisma
 * 2. Ejecutas `npm run prisma:generate` para generar tipos
 * 3. Importas los tipos en tu código TypeScript
 * 4. Usas Supabase SDK para las queries reales
 * 5. Los tipos de Prisma aseguran type safety en todo el código
 * 
 * VENTAJAS:
 * - Single source of truth para la estructura de datos
 * - Type safety completo en TypeScript
 * - Autocompletado en el IDE
 * - Detección de errores en tiempo de desarrollo
 * - Fácil refactoring cuando cambias el schema
 */

export type {
    Account, AuthContextType, CreateUserData, PublicUser, Session, User, UserComplete, UserWithAccounts, UserWithSessions
};

