import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { firstValueFrom } from 'rxjs';
import { QueryDslQueryContainer, SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { CreatedProductDTO } from './dto/created-product.dto';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  async searchProductsWithAi(query: string) {
    try {
      const aiResponseText = await this.searchOpenAi(query);

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
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async searchProducts(query: string) {
    const esQuery: QueryDslQueryContainer = {
      multi_match: {
        query: query,
        fields: ['title^3', 'description', 'features'],
        fuzziness: 'AUTO',
      },
    };

    const { hits } = await this.elasticsearchService.search({
      index: 'products',
      query: esQuery,
    });

    return hits.hits.map((h) => h._source);
  }

  async created(dto: CreatedProductDTO) {
    await this.elasticsearchService.index({
        index: 'products',
        document: dto
    });

    return 'Populate concluído';
  }

  private async searchOpenAi(query: string) {
    try{
      const payload = {
        contents: [
          {
            parts: [{ text: "Explain how AI works in a few words" }]
          }
        ]
      };
      const response = await firstValueFrom(
          this.httpService.post(
            process.env.GEMINI_API_URL!,
            payload,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY!
              },
            }
          )
      );
      return response.data.candidates[0]?.content.parts[0]?.text ?? 'Sem resposta';
    } catch (e) {
      if (e.response?.status === 429 &&
          e.response?.data?.error?.code === 'insufficient_quota') {
        throw new Error(
          'Sem quota na Geminis. Cadastre um cartão ou confira o painel de billing.'
        );
      }
      throw e;
    }
  }
}