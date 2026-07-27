import type { Request, Response } from "express";
import { ZodError } from "zod";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { executeSearch } from "./search.service.js";
import { searchSchema } from "./search.validation.js";
import { BadRequestError, ForbiddenError } from "../../shared/errors/index.js";
import { ensureWorkspaceMember } from "../../shared/authorization/workspace.js";
import { prisma } from "../../lib/prisma.js";

const getSingleValue = (val: string | string[] | undefined): string | undefined => {
    if (Array.isArray(val)) return val[0];
    return val;
};

export const searchController = asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate search query
    let validatedQuery;
    try {
        validatedQuery = searchSchema.parse(req.query);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new BadRequestError(error.issues[0]?.message || "Invalid search query");
        }
        throw error;
    }

    const queryStr = validatedQuery.q;

    // 2. Resolve active workspace and run authorization
    let activeWorkspaceId: string | undefined = 
        getSingleValue(req.params.workspaceId) || 
        validatedQuery.workspaceId || 
        getSingleValue(req.headers["x-workspace-id"]) || 
        getSingleValue(req.headers["workspace-id"]);

    try {
        if (!activeWorkspaceId) {
            const membership = await prisma.workspaceMember.findFirst({
                where: { userId: req.user!.id },
                select: { workspaceId: true },
            });
            if (!membership) {
                throw new ForbiddenError("You do not belong to any workspace.");
            }
            activeWorkspaceId = membership.workspaceId;
        } else {
            await ensureWorkspaceMember(req.user!.id, activeWorkspaceId);
        }
    } catch (error) {
        if (error instanceof ForbiddenError) {
            throw error;
        }
        // If ensureWorkspaceMember or findFirst throws (e.g. record not found P2025), map it to ForbiddenError
        throw new ForbiddenError("You do not have access to this workspace.");
    }

    // 3. Execute search
    const results = await executeSearch(req.user!.id, activeWorkspaceId, queryStr);

    res.json(results);
});