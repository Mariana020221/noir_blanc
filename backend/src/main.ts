import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('port') ?? 3000;
  const frontendUrl =
    configService.get<string>('frontendUrl') ?? 'http://localhost:5173';
  const uploadsPath = join(process.cwd(), 'uploads');

  console.log('================================');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT ENV:', process.env.PORT);
  console.log('PORT CONFIG:', port);
  console.log('FRONTEND_URL:', frontendUrl);
  console.log('================================');

  await mkdir(uploadsPath, { recursive: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Noir & Blanc API')
    .setDescription('Documentacion base de la API de Noir & Blanc.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port, '0.0.0.0');

  console.log('================================');
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
  console.log(`🌐 URL: ${await app.getUrl()}`);
  console.log('================================');
}

bootstrap().catch((error) => {
  console.error('Error al iniciar la aplicación');
  console.error(error);
  process.exit(1);
});
