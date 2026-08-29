import { IsArray, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendInvitationDto {
  @IsOptional()
  @Transform(({ value, obj }: { value: unknown; obj: Record<string, unknown> }) => {
    const raw = value || obj.email;
    if (typeof raw === 'string') {
      return raw.split(/[\n,]/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    }
    if (Array.isArray(raw)) {
      return raw.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    }
    return undefined;
  })
  @IsArray({ message: 'Please provide at least one email address.' })
  @IsEmail({}, { each: true, message: 'Each email address must be valid.' })
  emails?: string[];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? (value.trim() === '' ? undefined : value.trim().toLowerCase()) : value,
  )
  @IsString()
  email?: string;

  @IsUUID('4', { message: 'Role ID must be a valid UUID.' })
  roleId: string;
}
