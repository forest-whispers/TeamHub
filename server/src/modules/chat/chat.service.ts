import { eventBus } from "../../infrastructure/events/event-bus.js";
import { ensureDocumentInWorkspace } from "../../shared/authorization/document.js";
import { ensureWorkspaceAdmin, ensureWorkspaceMember } from "../../shared/authorization/workspace.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/index.js";
import type {
    SendMessageDto,
    EditMessageDto,
    ToggleReactionDto
} from "./chat.types.js";

export async function getMessages( requesterId: string, workspaceId: string, documentId: string, cursor?: string, limit: number = 30 ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const messages = await prisma?.chatMessage.findMany({
        where: {
            workspaceId,
            documentId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit + 1,
        ...(cursor && {
            cursor: {
                id: cursor,
            },
            skip: 1,
        }),
        select: {
            id: true,
            content: true,
            isEdited: true,
            createdAt: true,
            updatedAt: true,

            replyTo: {
                select: {
                    id: true,
                    content: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                }
            },

            isPinned: true,
            pinnedById: true,
            pinnedAt: true,
            pinnedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            },
            reactions: {
                select: {
                    id: true,
                    emoji: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },

            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            },
        }
    });


    let nextCursor: string | null = null;

    if (messages!.length > limit) {
        const nextItem = messages!.pop();
        nextCursor = nextItem!.id;
    }


    return {
        messages: messages!.reverse(),
        nextCursor,
    };
}

export async function sendMessage(requesterId: string, workspaceId: string, documentId: string, input: SendMessageDto, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const message = await prisma?.chatMessage.create({
        data: {
            senderId: requesterId,
            workspaceId,
            documentId,
            content: input.content,
            ...(input.replyToId !== undefined && { replyToId: input.replyToId }),
        },
        select: {
            id: true,
            content: true,
            isEdited: true,
            createdAt: true,
            updatedAt: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                }
            },
            isPinned: true,
            pinnedById: true,
            pinnedAt: true,
            pinnedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                }
            },
            reactions: {
                select: {
                    id: true,
                    emoji: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            mentions: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                }
            }
        }
    })

    if (input.mentionedUserIds?.length) {
        await prisma?.messageMention.createMany({
            data: input.mentionedUserIds.map(userId => ({
                messageId: message?.id,
                userId,
            })),
            skipDuplicates: true,
        });
    }

    await eventBus.emit("chat.message.created", {
        workspaceId,
        documentId,
        message,
        socketId
    });

    return message;
}

export async function editMessage(requesterId: string, workspaceId: string, documentId: string, messageId: string, input: EditMessageDto, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    if (!input.content?.trim()) {
        throw new BadRequestError("Message can't be empty")
    }

    const message = await prisma?.chatMessage.findUnique({
        where: { id: messageId },
        select: {
            senderId: true,
            content: true,
        }
    })

    if(!message || message.senderId !== requesterId)
    {
        throw new ForbiddenError("Message not found or you are not allowed to edit this message");
    }

    if(message.content === input.content)
    {
        throw new BadRequestError("No changes recognized");
    }

    input.content = input.content.trim();

    const { content } = input;

    const updatedMessage = await prisma?.chatMessage.update({
        where: { id: messageId, },
        data: { content, isEdited: true },
        select: {
            id: true,
            content: true,
            isEdited: true,
            createdAt: true,
            updatedAt: true,
            sender: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            mentions: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                }
            }
        }
    })

    await prisma?.messageMention.deleteMany({
        where: {
            messageId,
        },
    });

    if (input.mentionedUserIds?.length) {
        await prisma?.messageMention.createMany({
            data: input.mentionedUserIds.map(userId => ({
                messageId,
                userId,
            })),
            skipDuplicates: true,
        });
    }

    await eventBus.emit("chat.message.updated", {
        workspaceId,
        documentId,
        message: updatedMessage,
        socketId
    });

    return updatedMessage;
}

export async function deleteMessage(requesterId: string, workspaceId: string, documentId: string, messageId: string, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const message = await prisma?.chatMessage.findUnique({
        where: {
            id: messageId,
        },
        select: {
            senderId: true,
        },
    });

    if (!message || message.senderId !== requesterId) {
        throw new ForbiddenError("Message not found or you are not allowed to delete this message");
    }

    await prisma?.chatMessage.delete({
        where: {
            id: messageId,
        },
    });

    await eventBus.emit("chat.message.deleted", {
        workspaceId,
        documentId,
        messageId,
        socketId,
    });

    return {
        id: messageId,
    };
}

export async function pinMessage(requesterId: string, workspaceId: string, documentId: string, messageId: string, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    await ensureWorkspaceAdmin(requesterId, workspaceId);

    const message = await prisma?.chatMessage.findUnique({
        where: {
            id: messageId,
        },
        select: {
            isPinned: true,
        },
    });

    if (!message) {
        throw new NotFoundError("Message not found");
    }

    if (message.isPinned) {
        throw new BadRequestError("Message already pinned");
    }

    const updatedMessage = await prisma?.chatMessage.update({
        where: {
            id: messageId,
        },
        data: {
            isPinned: true,
            pinnedById: requesterId,
            pinnedAt: new Date(),
        },
        select: {
            id: true,
            isPinned: true,
            pinnedAt: true,
            pinnedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    await eventBus.emit("chat.message.pinned", {
        workspaceId,
        documentId,
        message: updatedMessage,
        socketId,
    });

    return updatedMessage;
}

export async function unpinMessage(requesterId: string, workspaceId: string, documentId: string, messageId: string, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    await ensureWorkspaceAdmin(requesterId, workspaceId);

    const message = await prisma?.chatMessage.findUnique({
        where: {
            id: messageId,
        },
        select: {
            isPinned: true,
        },
    });

    if (!message) {
        throw new NotFoundError("Message not found");
    }

    if (!message.isPinned) {
        throw new BadRequestError("Message is not pinned");
    }

    const updatedMessage = await prisma?.chatMessage.update({
        where: {
            id: messageId,
        },
        data: {
            isPinned: false,
            pinnedById: null,
            pinnedAt: null,
        },
        select: {
            id: true,
            isPinned: true,
            pinnedAt: true,
            pinnedBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    await eventBus.emit("chat.message.unpinned", {
        workspaceId,
        documentId,
        messageId,
        socketId,
    });

    return updatedMessage;
}

export async function toggleReaction(
    requesterId: string,
    workspaceId: string,
    documentId: string,
    messageId: string,
    input: ToggleReactionDto,
    socketId?: string,
) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const message = await prisma?.chatMessage.findUnique({
        where: {
            id: messageId,
        },
        select: {
            id: true,
        }
    });

    if (!message) {
        throw new NotFoundError("Message not found");
    }

    const existing = await prisma?.messageReaction.findUnique({
        where: {
            messageId_userId: {
                messageId,
                userId: requesterId,
            }
        }
    });

    let reactions;

    if (!existing) {
        await prisma?.messageReaction.create({
            data: {
                messageId,
                userId: requesterId,
                emoji: input.emoji,
            }
        });
    } else if (existing.emoji === input.emoji) {
        await prisma?.messageReaction.delete({
            where: {
                id: existing.id,
            }
        });
    } else {
        await prisma?.messageReaction.update({
            where: {
                id: existing.id,
            },
            data: {
                emoji: input.emoji,
            }
        });
    }

    reactions = await prisma?.messageReaction.findMany({
        where: {
            messageId,
        },
        select: {
            id: true,
            emoji: true,
            userId: true,
        }
    });

    await eventBus.emit("chat.message.reaction.updated", {
        workspaceId,
        documentId,
        messageId,
        reactions,
        socketId,
    });

    return reactions;
}