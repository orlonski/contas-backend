import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Contas API')
    .setDescription('API para sistema de controle financeiro')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
// Register robust handlers before starting the app so any startup errors are caught
process.on('unhandledRejection', (reason) => {
  const msg = (reason && typeof reason === 'object' && 'stack' in reason) ? (reason as any).stack : String(reason);
  console.error(`[${new Date().toISOString()}] Unhandled Rejection:`, msg);
  // give a tiny delay so logs flush, then exit
  setTimeout(() => process.exit(1), 100);
});

process.on('uncaughtException', (err) => {
  const msg = (err && typeof err === 'object' && 'stack' in err) ? (err as any).stack : String(err);
  console.error(`[${new Date().toISOString()}] Uncaught Exception:`, msg);
  setTimeout(() => process.exit(1), 100);
});

// Start the app and catch any errors synchronously/asynchronously
bootstrap().catch((err) => {
  console.error(`[${new Date().toISOString()}] Fatal error during bootstrap:`, err && (err.stack || err));
  process.exit(1);
});
