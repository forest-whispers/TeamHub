import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dashboardData = await dashboardService.getDashboardData(userId);
    res.json(dashboardData);
});