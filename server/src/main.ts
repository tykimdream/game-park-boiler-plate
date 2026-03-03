import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
};

bootstrap();
