process.loadEnvFile();

// PORT=3001
// DB_USER=postgres
// DB_PASSWORD=Angel_4220
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=eventconnect
// JWT_SECRET=supersecretkey
// JWT_EXPIRES_IN=1h
// DATABASE_URL=postgresql://postgres:Angel_4220@localhost:5432/eventconnect
// EMAIL_USER=eventconnect90@gmail.com
// EMAIL_PASS=oshzkgssiwxfdiqr

interface Config {
  dialect: Dialect;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
}

const env: Config = {
  dialect: (process.env.DB_DIALECT as Dialect) || "postgres",
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    name: process.env.DB_NAME || "postgres",
  },
};

export default env;
