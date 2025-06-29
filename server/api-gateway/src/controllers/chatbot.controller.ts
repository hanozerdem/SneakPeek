import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom as rxjsFirstValueFrom } from 'rxjs';

@Controller('chatbot')
export class ChatbotProxyController {
    constructor(private readonly httpService: HttpService) {}

    @Post('ask')
    async forwardToChatbot(@Body() body: { message: string }) {
        const response = await firstValueFrom(
                this.httpService.post('http://chatbot-service:50055/chatbot/ask', body)
            );
            
            return response.data;
    }
}

function firstValueFrom<T>(observable: Observable<T>): Promise<T> {
    return rxjsFirstValueFrom(observable);
}

