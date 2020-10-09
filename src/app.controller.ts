import { Controller, Get, Header } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'application/pdf')
  async getHello(): Promise<string> {
    return  (await this.appService.get('https://www.google.com')).toString()
    }
}
