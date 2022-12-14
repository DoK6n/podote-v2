import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Todo } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateTodoInput,
  TodoIdInput,
  UpdateTodoTitleInput,
  UpdateTodoDoneInput,
  UpdateTodoOrderkeyInput,
} from './dto';
import { uniqueIdGenerator } from '@/common/utils';

@Injectable()
export class TodosService {
  private readonly logger = new Logger(TodosService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createNewTodo(userId: string, data: CreateTodoInput) {
    const { title } = data;
    const count = await this.prisma.todo.count({
      where: {
        userId,
      },
    });

    return await this.prisma.todo.create({
      data: {
        id: uniqueIdGenerator('todo'),
        title: title,
        orderKey: count + 1,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async findAllTodosByUser(userId: string) {
    return await this.prisma.todo.findMany({
      where: {
        userId,
        isRemoved: false,
      },
      orderBy: {
        orderKey: 'desc',
      },
    });
  }

  async findOneTodoById(id: string, userId: string) {
    return await this.prisma.todo.findFirst({
      where: {
        id: id,
        userId,
        isRemoved: false,
      },
      include: {
        document: true,
      },
    });
  }

  async findOneRemovedTodo(id: string, userId: string) {
    return await this.prisma.todo.findFirst({
      where: {
        id: id,
        userId,
        isRemoved: true,
      },
    });
  }

  async findAllRemovedTodos(userId: string) {
    return await this.prisma.todo.findMany({
      where: {
        userId,
        isRemoved: true,
      },
      orderBy: {
        removedDt: 'desc',
      },
    });
  }

  async updateTodoTitleById(userId: string, data: UpdateTodoTitleInput) {
    const { id, title } = data;
    await this.prisma.todo.updateMany({
      where: {
        id: id,
        userId,
        isRemoved: false,
      },
      data: {
        title: title,
      },
    });
    return await this.findOneTodoById(id, userId);
  }

  async updateTodoDoneById(userId: string, data: UpdateTodoDoneInput) {
    const { id, done } = data;
    await this.prisma.todo.updateMany({
      where: {
        id: id,
        userId,
        isRemoved: false,
      },
      data: {
        done: done,
      },
    });
    return await this.findOneTodoById(id, userId);
  }

  /*
    $queryRaw??? ?????? ?????? ????????? ????????? ????????? ??? ????????????. ?????? ????????? ?????? $queryRawUnsafe??? ???????????? ?????????.
    let userTable = 'User';
    let result = await prisma.$queryRawUnsafe(`SELECT * FROM ${userTable}`);

    $queryRawUnsafe??? ????????? ????????? ?????? ???????????? SQL ?????? ????????? ????????? ????????????.
    SQL ????????? ????????? ??????????????? ????????? ???????????? ??????????????? ????????? ??? ?????? ???????????? ????????? ??? ????????????.
    ?????? $queryRaw ????????? ???????????? ?????? ????????????. SQL ????????? ????????? ?????? ????????? ????????? [OWASP SQL ????????? ?????????](https://owasp.org/www-community/attacks/SQL_Injection)??? ???????????????.
  */
  async updateTodoOrderkeyInput(userId: string, data: UpdateTodoOrderkeyInput) {
    const { TodoIdOrderKey } = data;
    let query = Prisma.sql`UPDATE podote_schema.todo as t SET order_key = c.order_key from (values `;

    TodoIdOrderKey.forEach((d, i) => {
      i < TodoIdOrderKey.length - 1
        ? (query = Prisma.sql`${query} (${d.id}, ${d.orderKey}, ${userId}), `)
        : (query = Prisma.sql`${query} (${d.id}, ${d.orderKey}, ${userId}) `);
    });

    query = Prisma.sql`${query}) as c (id, order_key, user_id) where c.user_id = t.user_id and c.id = t.id`;
    try {
      await this.prisma.$queryRaw<Todo[]>(query);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        this.logger.error(e);
        return e;
      }
    }
    return await this.findAllTodosByUser(userId);
  }

  async removeOneTodoById(userId: string, data: TodoIdInput) {
    const { id } = data;
    try {
      return await this.prisma.$transaction(async tx => {
        // todo ?????????
        await tx.todo.updateMany({
          where: {
            id,
            userId,
          },
          data: {
            isRemoved: true,
            removedDt: new Date(),
          },
        });
        // await tx.$queryRaw<Todo>`UPDATE todo SET is_removed = true, removed_dt = now() WHERE id = ${id} AND user_id = ${userId}`;

        // ????????? document ??????
        const document = await tx.document.findFirst({
          where: {
            todoId: id,
            userId,
            isRemoved: false,
          },
        });

        if (document) {
          // ????????? document??? ?????? ????????? document ????????? ?????? ??????
          await tx.document.updateMany({
            where: {
              id: document.id,
              todoId: id,
              userId,
            },
            data: {
              isRemoved: true,
              removedDt: new Date(),
            },
          });
        }

        return await tx.todo.findFirst({
          where: {
            id: id,
            userId,
            isRemoved: true,
          },
        });
      });
    } catch (e) {}
  }

  async restoreOneRemovedTodoById(userId: string, data: TodoIdInput) {
    const { id } = data;
    try {
      return await this.prisma.$transaction(async tx => {
        // todo ??????
        await tx.todo.updateMany({
          where: {
            id,
            userId,
          },
          data: {
            isRemoved: false,
            removedDt: null,
          },
        });

        // ????????? document ??????
        const document = await tx.document.findFirst({
          where: {
            todoId: id,
            userId,
            isRemoved: true,
          },
        });

        if (document) {
          // ????????? document??? ?????? ????????? document ???????????? ?????? ??????
          await tx.document.updateMany({
            where: {
              id: document.id,
              todoId: id,
              userId,
            },
            data: {
              isRemoved: false,
              removedDt: null,
            },
          });
        }

        return await tx.todo.findFirst({
          where: {
            id: id,
            userId,
            isRemoved: false,
          },
        });
      });
    } catch (e) {}
  }

  async deleteOneRemovedTodoById(userId: string, data: TodoIdInput) {
    const { id } = data;
    try {
      return await this.prisma.$transaction(async tx => {
        // ????????? ?????? document ??????
        const document = await tx.document.findFirst({
          where: {
            todoId: id,
            userId,
            isRemoved: true,
          },
        });

        // ?????? todo ????????????
        await tx.todo.deleteMany({
          where: {
            id,
            userId,
            isRemoved: true,
          },
        });
        // await tx.$queryRaw<Todo>`DELETE FROM todo WHERE id = ${id} AND user_id = ${userId} AND is_removed = true`;

        if (document) {
          // ????????? ?????? document ????????????
          await tx.document.deleteMany({
            where: {
              id: document.id,
              // todoId: id,
              userId,
              isRemoved: true,
            },
          });
          // await tx.$queryRaw<Document>`DELETE FROM document WHERE id = ${document.id} AND todoId = ${id} AND user_id = ${userId}`;
        }

        return await tx.todo.findMany({
          where: {
            userId,
            isRemoved: true,
          },
          orderBy: {
            removedDt: 'desc',
          },
        });
      });
    } catch (e) {}
  }

  async deleteAllRemovedTodos(userId: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        // ?????? todo ?????? ????????????
        await tx.todo.deleteMany({
          where: {
            userId,
            isRemoved: true,
          },
        });

        // ?????? document ?????? ????????????
        await tx.document.deleteMany({
          where: {
            userId,
            isRemoved: true,
          },
        });

        return await tx.todo.findMany({
          where: {
            userId,
            isRemoved: true,
          },
          orderBy: {
            removedDt: 'desc',
          },
        });
      });
    } catch (e) {}
  }
}
