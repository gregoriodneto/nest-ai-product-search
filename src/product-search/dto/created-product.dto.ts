import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreatedProductDTO {
     @ApiProperty({
        description: 'Título do produto',
        example: 'Smartphone Galaxy S21',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Descrição detalhada do produto',
        example: 'Um smartphone de última geração com câmera tripla e 128GB de armazenamento.',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Lista de recursos ou características do produto',
        example: ['Tela AMOLED', 'Câmera 108MP', '5G'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    features: string[];

    @ApiProperty({
        description: 'Preço do produto em reais',
        example: 2499.99,
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        description: 'Categoria do produto (ex: Eletrônicos, Moda, etc)',
        example: 'Eletrônicos',
    })
    @IsString()
    @IsNotEmpty()
    category: string;
}