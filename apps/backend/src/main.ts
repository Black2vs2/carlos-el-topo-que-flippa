import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, NextFunction } from 'express';

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Auth middleware - runs before everything
  const authToken = process.env.AUTH_TOKEN;
  if (authToken) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/health') return next();

      const headerToken = req.headers['x-auth-token'] as string;
      const queryToken = req.query.token as string;
      const cookieToken = parseCookie(req.headers.cookie, 'aoflip_token');

      if (headerToken === authToken || queryToken === authToken || cookieToken === authToken) {
        // Set cookie on first query-param auth so refreshes work
        if (queryToken === authToken && !cookieToken) {
          res.cookie('aoflip_token', authToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 365 * 24 * 60 * 60 * 1000,
          });
        }
        return next();
      }

      res.status(401).json({ message: 'Unauthorized' });
    });
  }

  // Serve static frontend files in production
  const clientPath = join(__dirname, 'client');
  if (existsSync(clientPath)) {
    app.useStaticAssets(clientPath);
  }

  const config = new DocumentBuilder().setTitle('Carlos El Topo Que Gira API').setDescription('Carlos El Topo Que Gira API').setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  app.enableCors({ origin: '*' });
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
