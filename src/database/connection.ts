import {cliente} from './config';

export const startDatabase = async (): Promise<void> => {
  await cliente.connect()
  console.log('Database connected!')
}
