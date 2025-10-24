import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 12;

export const hash = (password: string) => bcrypt.hashSync(password, BCRYPT_ROUNDS)
export const compare = (password: string, encrypted: string) => bcrypt.compareSync(password, encrypted)
