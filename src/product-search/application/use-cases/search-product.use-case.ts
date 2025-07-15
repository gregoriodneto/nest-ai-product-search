import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types";
import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";

@Injectable()
export class SearchProductUseCase {
    constructor(
        private readonly elasticsearchService: ElasticsearchService,
      ) {}
    
    async execute(query: string) {
        const params = this.parseQuery(query);

        const must: QueryDslQueryContainer[] = [];

        if (params.termos.length > 0) {
            must.push({
                multi_match: {
                    query: params.termos.join(' '),
                    fields: ['title^3', 'description^2', 'features', 'category'],
                    fuzziness: 'AUTO'
                }
            });
        }

        if (params.precoMin !== null || params.precoMax !== null) {
            must.push({
                range: {
                    price: {
                        ...(params.precoMin !== null ? { gte: params.precoMin } : {}),
                        ...(params.precoMax !== null ? { lte: params.precoMax } : {}),
                    }
                }
            })
        }

        const result = await this.elasticsearchService.search({
            index: 'products',
            size: params.quantidade || 10,
            sort: params.ordenarPorPrecoAsc ? [{ price: 'asc' }] : undefined,
            query: {
                bool: {
                    must
                }
            }
        })
    
        return result.hits.hits.map((h) => h._source);
    }

    parseQuery(query: string) {
        const result = {
            termos: [] as string[],
            precoMin: null as number | null,
            precoMax: null as number | null,
            ordenarPorPrecoAsc: false,
            quantidade: null as number | null,
        };

        const cleanQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const tokens = cleanQuery.split(/\s+/).filter(Boolean);

        const priceRegex = /\d{2,5}/g;
        const numbers = cleanQuery.match(priceRegex)?.map(Number) || [];

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (token === 'até' && numbers[i]) {
                result.precoMax = numbers[i];
            }

            if ((token === 'entre' || token === 'de') && numbers[i] && numbers[i + 1]) {
                result.precoMin = numbers[i];
                result.precoMax = numbers[i + 1];
            }

            if (['barato', 'baratas', 'menor', 'menores'].includes(token)) {
                result.ordenarPorPrecoAsc = true;
            }

            if (['tv', 'tvs', 'camiseta', 'camisetas', 'produto', 'produtos', 'item', 'itens'].includes(tokens[i + 1])) {
                const possibleQty = parseInt(token);
                if (!isNaN(possibleQty)) {
                    result.quantidade = possibleQty;
                }
            }

            if (!['quero', 'ver', 'mais', 'com', 'preco', 'ate', 'entre', 'de', 'por', 'a', 'e'].includes(token) && isNaN(Number(token))) {
                result.termos.push(token);
            }
        }

        return result;
    }
}