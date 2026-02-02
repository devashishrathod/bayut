import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { INestApplication } from '@nestjs/common';
import express from 'express';
import { AppModule } from '../src/app.module';

let cachedApp: INestApplication | null = null;
let cachedServer: ReturnType<typeof express> | null = null;

async function init() {
  if (cachedApp && cachedServer)
    return { app: cachedApp, server: cachedServer };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  const allowedOrigins = (
    process.env.FRONTEND_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  cachedApp = app;
  cachedServer = server;

  return { app, server };
}

export default async function handler(req: any, res: any) {
  const { server } = await init();
  return server(req, res);
}
