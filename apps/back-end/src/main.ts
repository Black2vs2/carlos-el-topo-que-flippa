import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('Carlos El Topo Que Gira API').setDescription('Carlos El Topo Que Gira API').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  app.enableCors({ origin: '*' });
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000);
}
bootstrap();
