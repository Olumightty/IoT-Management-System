import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const dataSource = new DataSource({
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/*-migration.ts'],
  migrationsRun: false,
  extra: {
    family: 4,
  },
  synchronize: process.env.NODE_ENV === 'development', // Keep true for development only
  logging: true, // Helpful for debugging joins
});
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      return dataSource.initialize();
    },
  },
];

export default dataSource;
