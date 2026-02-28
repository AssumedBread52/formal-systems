import { OwnershipException } from '@/auth/exceptions/ownership.exception';
import { validatePayload } from '@/common/helpers/validate-payload';
import { ExpressionEntity } from '@/expression/entities/expression.entity';
import { ExpressionType } from '@/expression/enums/expression-type.enum';
import { ExpressionNotFoundException } from '@/expression/exceptions/expression-not-found.exception';
import { InUseException } from '@/expression/exceptions/in-use.exception';
import { UniqueSequenceException } from '@/expression/exceptions/unique-sequence.exception';
import { NewExpressionPayload } from '@/expression/payloads/new-expression.payload';
import { ExpressionRepository } from '@/expression/repositories/expression.repository';
import { SymbolEntity } from '@/symbol/entities/symbol.entity';
import { SymbolType } from '@/symbol/enums/symbol-type.enum';
import { SymbolReadService } from '@/symbol/services/symbol-read.service';
import { SystemReadService } from '@/system/services/system-read.service';
import { UserReadService } from '@/user/services/user-read.service';
import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ExpressionWriteService {
  public constructor(private readonly eventEmitter2: EventEmitter2, private readonly expressionRepository: ExpressionRepository, private readonly symbolReadService: SymbolReadService, private readonly systemReadService: SystemReadService, private readonly userReadService: UserReadService) {
  }

  public async create(userId: string, systemId: string, newExpressionPayload: NewExpressionPayload): Promise<ExpressionEntity> {
    try {
      const validatedNewExpressionPayload = validatePayload(newExpressionPayload, NewExpressionPayload);

      const system = await this.systemReadService.selectById(systemId);

      const user = await this.userReadService.selectById(userId);

      if (user.id !== system.createdByUserId) {
        throw new OwnershipException();
      }

      const symbols = await this.symbolReadService.selectByIds(system.id, validatedNewExpressionPayload.symbolIds);

      const conflict = await this.expressionRepository.findOneBy({
        symbolIds: validatedNewExpressionPayload.symbolIds,
        systemId: system.id
      });

      if (conflict) {
        throw new UniqueSequenceException();
      }

      const expression = new ExpressionEntity();

      expression.symbolIds = newExpressionPayload.symbolIds;
      expression.type = symbols.reduce((type: ExpressionType, symbol: SymbolEntity, index: number): ExpressionType => {
        if (index === 0 && SymbolType.constant === symbol.type) {
          return ExpressionType.constant_prefixed;
        } else if (index === 1 && SymbolType.variable === symbol.type && ExpressionType.constant_prefixed === type) {
          return ExpressionType.constant_variable_pair;
        } else if (index === 2 && ExpressionType.constant_variable_pair === type) {
          return ExpressionType.constant_prefixed;
        }

        return type;
      }, ExpressionType.standard);
      expression.systemId = system.id;
      expression.createdByUserId = user.id;

      const savedExpression = await this.expressionRepository.save(expression);

      await this.eventEmitter2.emitAsync('expression.create.completed', savedExpression);

      return savedExpression;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Creating expression failed');
    }
  }

  public async delete(userId: string, systemId: string, expressionId: string): Promise<ExpressionEntity> {
    try {
      const expression = await this.expressionRepository.findOneBy({
        id: expressionId,
        systemId
      });

      if (!expression) {
        throw new ExpressionNotFoundException();
      }

      const user = await this.userReadService.selectById(userId);

      if (user.id !== expression.createdByUserId) {
        throw new OwnershipException();
      }

      if (expression.isInUse()) {
        throw new InUseException();
      }

      const deletedExpression = await this.expressionRepository.remove(expression);

      await this.eventEmitter2.emitAsync('expression.delete.completed', deletedExpression);

      return deletedExpression;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Deleting expression failed');
    }
  }
};
