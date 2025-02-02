import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Momento API")
    .setDescription("Momento API Documentation")
    .setVersion("1.0")
    .addTag("momento")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app
    .listen(process.env.PORT ?? 3000)
    .then(() =>
      console.log(
        `Application is running on http://localhost:${process.env.PORT ?? 3000}`,
      ),
    );
}
bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  throw error;
});
