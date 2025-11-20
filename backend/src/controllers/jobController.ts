import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as JobModel from '../models/Job';

export const getJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const job = await JobModel.findJobById(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(job);
  } catch (error: any) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
};

export const getUserJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const jobs = await JobModel.findJobsByUserId(userId);

    res.json(jobs);
  } catch (error: any) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};
