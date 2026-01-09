import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ credentials: true, origin: true });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      host: process.env.MQTT_HOST,
      port: +process.env.MQTT_PORT!,
      clientId: process.env.MQTT_CLIENT_ID,
      protocolVersion: 5,
      subscribeOptions: {
        qos: 0,
      },
    },
  });
  const config = new DocumentBuilder()
    .setTitle('IoT Management System')
    .setDescription('The IoT Management System API description')
    .setVersion('1.0')
    .addTag('iot')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(morgan('dev'));
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
