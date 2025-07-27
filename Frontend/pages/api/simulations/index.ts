import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { userId, platform, status } = req.query;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId as string);
        if (platform) params.append('platform', platform as string);
        if (status) params.append('status', status as string);
        
        // Fetch real data from backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/v1/simulation?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch simulations from backend');
        }

        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error fetching simulations:', error);
        res.status(500).json({ error: 'Failed to fetch simulations' });
      }
      break;

    case 'POST':
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/v1/simulation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });

        if (!response.ok) {
          throw new Error('Failed to create simulation');
        }

        const data = await response.json();
        res.status(201).json(data);
      } catch (error) {
        console.error('Error creating simulation:', error);
        res.status(500).json({ error: 'Failed to create simulation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 