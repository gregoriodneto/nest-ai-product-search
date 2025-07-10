import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { firstValueFrom } from 'rxjs';
import { QueryDslQueryContainer, SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { CreatedProductDTO } from './dto/created-product.dto';
import axios from 'axios';
import * as readline from 'readline';
import { MongooseProductsRepository } from './infrastructure/repositories/mongoose-products.repository';
import { Product } from './infrastructure/entities/products.entity';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly productRepo: MongooseProductsRepository
  ) {}

  async created(dto: CreatedProductDTO) {
    const product = await this.productRepo.create(dto);
    this.syncProductToElastic(product);
    return 'Produto Cadastrado!';
  }

  async sync() {
    const products = await this.productRepo.getAll();

    for (const product of products) {
      this.syncProductToElastic(product);
    }
    return "Sincronismo realizado com sucesso!";
  }

  async searchProductsWithAi(query: string) {
    try {
      const aiResponseText = await this.searchOpenAi(query);

      if (!aiResponseText.trim().startsWith('{')) {
        throw new Error('A resposta da IA não é um JSON válido.');
      }

      const filters = JSON.parse(aiResponseText);

      const esQuery: QueryDslQueryContainer = {
        bool: {
          must:
            filters.features?.map(
              (f) => ({ match: { features: f } } as QueryDslQueryContainer),
            ) ?? [],
          filter: [
            { term: { category: filters.category } } as QueryDslQueryContainer,
            ...(filters.price
              ? [
                  {
                    range: { price: filters.price },
                  } as QueryDslQueryContainer,
                ]
              : []),
          ],
        },
      };

      const sortOptions: SortCombinations[] | undefined = filters.sort_by
      ? [
          {
            [filters.sort_by]: {
              order: (filters.sort_order ?? 'desc') as 'asc' | 'desc',
            },
          },
        ]
      : undefined;

      const { hits } = await this.elasticsearchService.search<any>({
        index: 'products',
        query: esQuery,
        ...(sortOptions ? { sort: sortOptions } : {}),
      });

      return hits.hits.map(hit => hit._source);
    } catch (error: any) {
      if (error.message.includes('Sem quota'))
        return this.searchProducts(query);
      throw new Error(error.message);
    }
  }

  async searchProducts(query: string) {
    const tokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    const categoryQueries = tokens.map(token => ({
      match_phrase: {
        category: token
      }
    }));

    const mustQueries = [
      {
        multi_match: {
          query: query,
          fields: ['title^3', 'description', 'features'],
          fuzziness: 'AUTO',
        },
      }
    ]

    const esQuery: QueryDslQueryContainer = {
      bool: {
        must: mustQueries,
        should: categoryQueries,
        minimum_should_match: 0
      }
    };

    const { hits } = await this.elasticsearchService.search({
      index: 'products',
      query: esQuery,
    });

    return hits.hits.map((h) => h._source);
  }

  private async searchOpenAi(query: string) {
    try{
      const payload = {
        model: 'mistral',
        prompt: `Você é um assistente que transforma frases de pesquisa em filtros para o Elasticsearch. 
          Dada a frase: "${query}", retorne apenas um objeto JSON com as seguintes chaves possíveis:

          - "category": string
          - "price": objeto com "gte" e/ou "lte"
          - "features": array de strings
          - "sort_by": string (opcional)
          - "sort_order": "asc" ou "desc" (opcional)

          Exemplo:
          {
            "category": "eletrônicos",
            "price": { "gte": 1000, "lte": 2000 },
            "features": ["bluetooth", "wireless"],
            "sort_by": "price",
            "sort_order": "asc"
          }

          Agora gere o JSON para: "${query}"
          IMPORTANTE: Responda somente o JSON, sem explicações.`
      };
      const response = await axios.post(
        process.env.OLLAMA_MISTRAL_URL!,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'stream',
        }
      )

      let responseText = '';

      const rl = readline.createInterface({
        input: response.data,
        crlfDelay: Infinity
      });

      for await (const line of rl) {
        try {
          const json = JSON.parse(line);
          responseText += json.response ?? '';
        } catch (error) {
          console.log('Erro ao parsear linha', line);
        }
      }

      return responseText.trim() || 'Sem resposta';
    } catch (e) {
      throw new Error('Erro ao consultar IA local via Ollama');
    }
  }

  private async syncProductToElastic(product: Product) {
    await this.elasticsearchService.index({
      index: 'products',
      id: product._id.toString(),
      document: {
        title: product.title,
        description: product.description,
        category: product.category,
        features: product.features,
        price: product.price
      }
    })
  }
}