import * as bcrypt from 'bcrypt';

export async function validatePassword({
  stored,
  provided,
}: {
  stored: string;
  provided: string;
}): Promise<boolean> {
  return bcrypt.compare(provided || '', stored);
}
