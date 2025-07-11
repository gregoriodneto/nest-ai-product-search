import { Injectable } from '@nestjs/common';
import { CreateProductSearchUseCase } from 'src/product-search/application/use-cases/create-product-search.use-case';
import { UpdateProductSearchUseCase } from 'src/product-search/application/use-cases/update-product-search.use-case';
import { FindOneProductSearchUseCase } from 'src/product-search/application/use-cases/find-one-product-search.use-case';

import { CreateProductSearchDto } from 'src/product-search/interface/http/dto/create-product-search.dto';
import { UpdateProductSearchDto } from 'src/product-search/interface/http/dto/update-product-search.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FindManyProductSearchsUseCase } from '../use-cases/find-many-product-search.use-case';
import { QueryDslQueryContainer, SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import axios from 'axios';
import { SyncProductSearchsUseCase } from '../use-cases/sync-product-search.use-case';

@Injectable()
export class ProductSearchService {
  private readonly elasticsearchService: ElasticsearchService;
  constructor(
    private readonly createProductSearchUC:   CreateProductSearchUseCase,
    private readonly updateProductSearchUC:   UpdateProductSearchUseCase,
    private readonly findManyProductSearchsUC: FindManyProductSearchsUseCase,
    private readonly findOneProductSearchUC:   FindOneProductSearchUseCase,
    private readonly syncProductSearchUC: SyncProductSearchsUseCase,    
  ) {}

  async create(dto: CreateProductSearchDto) {
    return this.createProductSearchUC.execute(dto);
  }

  async update(id: string, dto: UpdateProductSearchDto) {
    return this.updateProductSearchUC.execute(id, dto);
  }

  async findAll() {
    return this.findManyProductSearchsUC.execute();
  }

  async findOne(id: string) {
    return this.findOneProductSearchUC.execute({ _id: id });
  }

  async sync() {
    await this.syncProductSearchUC.execute();
    return "Sync realizado com sucesso!"
  }

  async searchProductsWithAi(query: string) {
    try {
      const aiResponseText = await this.searchOpenAi(query);

      if (!aiResponseText.trim().startsWith('{')) {
        throw new Error('A resposta da IA não é um JSON válido.');
      }

      const filters = JSON.parse(aiResponseText);

      const mustConditions: QueryDslQueryContainer[] = filters.features?.map(
        (f) => ({ match: { features: f } })
      ) ?? [];

      const filterConditions: QueryDslQueryContainer[] = [];

      if (filters.category) {
        filterConditions.push({ term: { category: filters.category } })
      }

      if (filters.price) {
        filterConditions.push({ range: { price: filters.price } });
      }

      const esQuery: QueryDslQueryContainer = {
        bool: {
          must: mustConditions,
          filter: filterConditions,
        },
      };


      const isValidSortField = filters.sort_by && ['price'].includes(filters.sort_by)
      const sortOptions: SortCombinations[] | undefined = isValidSortField
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
      console.error(error.message, error.stack)
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
        model: process.env.OLLAMA_MODEL_AI,
        stream: false,
        raw: true,
        prompt: `Você é um assistente que transforma frases de pesquisa em filtros para o Elasticsearch. 
          Dada a frase: "${query}", retorne apenas um objeto JSON com as seguintes chaves possíveis:

          - "category": string (opcional)
          - "price": objeto com "gte" e/ou "lte" (opcional)
          - "features": array de strings (opcional)
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
      const start = Date.now();
      const response = await axios.post(
        process.env.OLLAMA_MISTRAL_URL!,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
      console.log('Tempo total (ms):', Date.now() - start);
      const responseText = response.data.trim() || '';

      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.indexOf('}');
      const jsonStr = responseText.slice(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr);
    } catch (e: any) {
      console.log('Erro original ao consultar Ollama:', e)
      throw new Error('Erro ao consultar IA local via Ollama', e.message);
    }
  }
}