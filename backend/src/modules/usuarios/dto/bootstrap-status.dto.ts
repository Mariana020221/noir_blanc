import { ApiProperty } from '@nestjs/swagger';

export class BootstrapStatusDto {
  @ApiProperty({
    example: true,
    description:
      'Indica si todavia no existe ningun usuario y se permite crear el primer administrador.',
  })
  canCreateFirstAdmin: boolean;
}
