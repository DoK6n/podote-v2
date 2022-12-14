import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { uniqueIdGenerator } from '@/common/utils';
import {
  CreateDocumentInput,
  DeleteDocumentInput,
  FindOneDocumentInput,
  RemoveDocumentInput,
  RestoreDocumentInput,
  UpdateDocumentInput,
} from './dto';
import { Todo, Document } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createNewDocument(userId: string, data: CreateDocumentInput) {
    const { todoId, content } = data;
    try {
      return await this.prisma.$transaction(async tx => {
        const newDocument = await tx.document.create({
          data: {
            id: uniqueIdGenerator('document'),
            content: JSON.parse(JSON.stringify(content)),
            userId,
            todoId,
          },
        });

        await tx.todo.updateMany({
          where: {
            id: todoId,
            documentId: null,
          },
          data: {
            documentId: newDocument.id,
          },
        });

        return newDocument;
      });
    } catch (e) {}
  }

  async findAllDocumentsByUserId(userId: string) {
    return await this.prisma.document.findMany({
      where: {
        userId,
        isRemoved: false,
      },
      include: {
        todo: true,
      },
    });
  }

  async findOneDocumentById(userId: string, data: FindOneDocumentInput) {
    const { id } = data;

    return await this.prisma.document.findFirst({
      where: {
        id,
        userId,
        isRemoved: false,
      },
      include: {
        todo: true,
      },
    });
  }

  async findOneRemovedDocumentById(userId: string, data: FindOneDocumentInput) {
    const { id } = data;

    return await this.prisma.document.findFirst({
      where: {
        id,
        userId,
        isRemoved: true,
      },
      include: {
        todo: true,
      },
    });
  }

  async findAllRemovedDocuments(userId: string) {
    return await this.prisma.document.findMany({
      where: {
        userId,
        isRemoved: true,
      },
      include: {
        todo: true,
      },
    });
  }

  async updateDocumentById(userId: string, data: UpdateDocumentInput) {
    const { id, content } = data;
    // document ?????? ??????
    await this.prisma.document.updateMany({
      where: {
        id,
        userId,
        isRemoved: false,
      },
      data: {
        content: JSON.parse(JSON.stringify(content)),
      },
    });
    return await this.findOneDocumentById(userId, { id });
  }

  // document ??????????????? ??????
  async removeDocumentById(userId: string, data: RemoveDocumentInput) {
    const { id } = data;

    try {
      return await this.prisma.$transaction(async tx => {
        // ????????? ??? ????????? todo??? ????????? ??????
        const todo = await tx.todo.findFirst({
          where: {
            documentId: id,
            isRemoved: false,
          },
        });

        // document??? ??????????????? ??????
        await tx.document.updateMany({
          where: {
            id,
            userId,
            isRemoved: false,
          },
          data: {
            isRemoved: true,
            removedDt: new Date(),
            todoId: null,
          },
        });

        // ????????? todo??? ???????????? todo?????? documentId ???????????? ?????? ??????
        if (todo) {
          await tx.$queryRaw<Todo>`UPDATE todo SET document_id = null WHERE id = ${todo.id} AND user_id = ${userId}`;
        }

        // todo??? ????????? ???????????? ???????????? ?????? document ???????????? ??????
        return await tx.document.findFirst({
          where: {
            id,
            userId,
            todoId: null,
            isRemoved: true,
          },
        });
      });
    } catch (e) {}
  }

  // document ??????????????? ????????????
  async restoreRemovedDocumentById(userId: string, data: RestoreDocumentInput) {
    const { id } = data;

    try {
      return await this.prisma.$transaction(async tx => {
        // document??? ????????? todo??? ????????? ??????
        const todo = await tx.todo.findFirst({
          where: {
            documentId: id,
            userId,
            isRemoved: true,
          },
        });

        // ????????? todo??? ?????? document??? document??? ?????? ????????? ??? ??????
        if (todo) {
          // TODO Error ????????? ??????
          throw new ApolloError(
            '????????? ????????? ???????????? ????????? ????????? ??? ????????????',
            'EXIST_CONNECTED_TODO_ERROR',
            {
              customErrorCode: 401,
            },
          );
        }

        // todo??? ?????? ?????? ??? document??? ??????
        await tx.$queryRaw<Document>`
          UPDATE document SET is_removed = false, removed_dt = null, todo_id = null WHERE id = ${id} AND user_id = ${userId}
        `;

        return await tx.document.findFirst({
          where: {
            id,
            userId,
            todoId: null,
            isRemoved: false,
          },
        });
      });
    } catch (e) {
      if (e instanceof ApolloError) {
        this.logger.error(e);
        return e;
      }
    }
  }

  // ?????? ?????? ??????
  async deleteRemovedDocumentById(userId: string, data: DeleteDocumentInput) {
    const { id } = data;

    try {
      return await this.prisma.$transaction(async tx => {
        // ????????? todo?????? ?????? ??????????????? ????????? ??????????????? ????????? ?????? ??????
        const todo = await tx.todo.findFirst({
          where: {
            documentId: id,
            isRemoved: true,
          },
        });

        // ?????? documentId??? ????????? ?????? ????????? todo??? ?????? ??????
        if (todo) {
          // ????????? todo?????? documentId??? ??????
          await tx.todo.updateMany({
            where: {
              id: todo.id,
              userId,
              documentId: id,
              isRemoved: true,
            },
            data: {
              documentId: null,
            },
          });
        }

        // document ?????? ??????
        await tx.$queryRaw<Document>`DELETE FROM document WHERE id = ${id} AND is_removed = true AND user_id = ${userId}`;
      });
    } catch (e) {}
  }

  async deleteAllRemovedDocuments(userId: string) {
    try {
      return await this.prisma.$transaction(async tx => {
        // ?????? todo ?????? ????????????
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
