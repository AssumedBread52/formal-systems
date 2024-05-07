import { UserEntity } from '@/user/user.entity';

export class UserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  systemCount: number;
  constantSymbolCount: number;
  variableSymbolCount: number;
  axiomCount: number;
  theoremCount: number;
  deductionCount: number;

  constructor(user: UserEntity) {
    const { _id, firstName, lastName, email, systemCount, constantSymbolCount, variableSymbolCount, axiomCount, theoremCount, deductionCount } = user;

    this.id = _id.toString();
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.systemCount = systemCount;
    this.constantSymbolCount = constantSymbolCount;
    this.variableSymbolCount = variableSymbolCount;
    this.axiomCount = axiomCount;
    this.theoremCount = theoremCount;
    this.deductionCount = deductionCount;
  }
};
