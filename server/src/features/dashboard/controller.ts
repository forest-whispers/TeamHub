import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import * as dashboardService from "./service.js";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dashboardData = await dashboardService.getDashboardData(userId);
    res.json(dashboardData);
});