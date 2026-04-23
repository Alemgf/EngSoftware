import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Gera hash da senha em texto. Usar apenas em server actions.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/**
 * Verifica se a senha em texto corresponde ao hash. Usar apenas em server actions.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
