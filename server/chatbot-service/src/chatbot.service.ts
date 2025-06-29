import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';
const API_URL = 'http://api-gateway:9000/api/products/';

interface GetAllProductsResponse {
  status: boolean;
  message: string;
  products: Product[];
}

interface Product {
  productId: number;
  productName?: string;
  model?: string;
  brand?: string;
  serialNumber?: string;
  price?: number;
  currency?: string;
  warrantyStatus?: string;
  distributor?: string;
  description?: string;
  color?: string;
  category?: string;
  imageUrl?: string;
  tags?: string[];
  sizes?: any[];
  prices?: any[];
  reviews?: any[];
  rating?: number;
  popularity?: number;
  sales?: number;
  currentPriceType?: string;
}

function toMarkdown(p: Product): string {
  const url = `${BASE_URL}/products/${p.productId}`;
  const desc = p.description ?? '';
  const priceInfo = p.price != null ? ` | Fiyat: ${p.price}${p.currency ?? ''}` : '';
  return `• [**${p.productName ?? 'Ürün'}**](${url}) – ${desc}${priceInfo}`;
}

@Injectable()
export class ChatbotService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async chat(userContent: string): Promise<string> {
    const lang: 'tr' | 'en' = /[çğıöşü]/i.test(userContent) ? 'tr' : 'en';

    // Ürünleri çek
    let products: Product[] = [];
    try {
      const res = await axios.get<GetAllProductsResponse>(API_URL);
      if (res.data.status) {
        products = res.data.products;
      } else {
        return this.fail('Ürünler alınamadı.', lang);
      }
    } catch (err) {
      console.error(err);
      return this.fail('Sunucu hatası.', lang);
    }

    // Kullanıcı bütçesini çıkar (örn. "1000 TL", "$200")
    const budgetMatch = userContent.match(/(\d+(?:[.,]\d+)*)\s*(?:tl|₺|\$|usd)?/i);
    const userBudget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '.')) : null;

    // Hafif ürün verilerini hazırla
    const lightProductList = products.map(p => ({
      id: p.productId,
      tags: p.tags,
      color: p.color,
      brand: p.brand
    }));

    const promptToAI = `
Kullanıcıdan gelen prompt: "${userContent}"

Aşağıda sadece özet bilgileri verilen ürünler var (id, tag, renk ve marka bilgisi). 
Senin görevin bu ürünlerden en iyi uyan 3 tanesinin ID’sini seçmek. 
Kriterin sadece prompt’taki isteklerle en çok eşleşenler olmalı. 
Eğer kullanıcı bütçe belirttiyse (örn. 1000 TL), fiyatı göz önünde bulundurup en yakın fiyatlı ürünleri sıralayabilirsin. 
Yanıt formatı şu şekilde olmalı: [id1, id2, id3] veya []

Ürün listesi:
${JSON.stringify(lightProductList, null, 2)}
    `.trim();

    // OpenAI'den öneri al
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sadece ürün id’si öneren bir asistan ol.' },
        { role: 'user', content: promptToAI }
      ],
      temperature: 0.1
    });

    const content = completion.choices[0].message.content ?? '';
    let ids: number[] = [];
    try {
      ids = JSON.parse(content.trim());
    } catch (e) {
      console.error('OpenAI ID parse error:', e);
    }

    let matchedProducts = products.filter(p => ids.includes(p.productId));
    if (matchedProducts.length === 0) {
      return this.fail('Uygun ürün bulunamadı.', lang);
    }

    // Bütçe varsa fiyat yakınlığına göre sırala
    if (userBudget != null) {
      matchedProducts = matchedProducts.sort((a, b) => {
        const pa = a.price ?? 0;
        const pb = b.price ?? 0;
        return Math.abs(pa - userBudget) - Math.abs(pb - userBudget);
      });
    }

    const result = matchedProducts.slice(0, 3).map(toMarkdown).join('\n');

    // Özel öneri mesajı ekle
    const best = matchedProducts[0];
    const bestUrl = `${BASE_URL}/products/${best.productId}`;
    const suggestion = lang === 'tr'
      ? `\n\nÖzellikle [**${best.productName}**](${bestUrl}) sizin isteğinize çok uygun olabilir, göz atabilirsiniz.`
      : `\n\nEspecially [**${best.productName}**](${bestUrl}) might be perfect for you, check it out.`;

    return lang === 'tr'
      ? `FINAL: Sorgunuza uygun ürün önerileri:\n${result}${suggestion}`
      : `FINAL: Here are the best-matching products:\n${result}${suggestion}`;
  }

  private fail(msg: string, lang: 'tr' | 'en'): string {
    return lang === 'tr' ? `FINAL: ${msg}` : `FINAL: ${msg}`;
  }

  public async getChatReply(message: string): Promise<string> {
    return this.chat(message);
  }
}
