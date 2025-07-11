import { ApiProperty } from '@nestjs/swagger';

export class CreateProductSearchDto {
   
    @ApiProperty({ example: "id", description: "id" }) 
    id : string 
   
    @ApiProperty({ example: "title", description: "title" }) 
    title : string 
   
    @ApiProperty({ example: "description", description: "description" }) 
    description : string 
   
    @ApiProperty({ example: "category", description: "category" }) 
    category : string 
   
    @ApiProperty({ example: "features", description: "features" }) 
    features : any 
   
    @ApiProperty({ example: "price", description: "price" }) 
    price : number 
  }