import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
    const connectionString = process.env.TURSO_DATABASE_URL

    if (connectionString?.startsWith('libsql://') || connectionString?.startsWith('https://')) {
        const libsql = createClient({
            url: connectionString,
            authToken: process.env.TURSO_AUTH_TOKEN
        })
        const adapter = new PrismaLibSQL(libsql)
        return new PrismaClient({ adapter: adapter as any })
    }


    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
