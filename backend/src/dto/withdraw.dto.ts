import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'User wallet address',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Amount of BTC to withdraw',
    example: 0.05,
    minimum: 0.001,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  amount: number;
}
