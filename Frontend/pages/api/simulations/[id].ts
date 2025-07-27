import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Simulation ID is required' });
  }

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

  switch (method) {
    case 'GET':
      try {
        const response = await fetch(`${backendUrl}/api/v1/simulation/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return res.status(404).json({ error: 'Simulation not found' });
          }
          throw new Error('Failed to fetch simulation');
        }

        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error fetching simulation:', error);
        res.status(500).json({ error: 'Failed to fetch simulation' });
      }
      break;

          case 'PUT':
        try {
          const response = await fetch(`${backendUrl}/api/v1/simulation/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });

        if (!response.ok) {
          if (response.status === 404) {
            return res.status(404).json({ error: 'Simulation not found' });
          }
          throw new Error('Failed to update simulation');
        }

        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error updating simulation:', error);
        res.status(500).json({ error: 'Failed to update simulation' });
      }
      break;

          case 'DELETE':
        try {
          const response = await fetch(`${backendUrl}/api/v1/simulation/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          if (response.status === 404) {
            return res.status(404).json({ error: 'Simulation not found' });
          }
          throw new Error('Failed to delete simulation');
        }

        res.status(204).end();
      } catch (error) {
        console.error('Error deleting simulation:', error);
        res.status(500).json({ error: 'Failed to delete simulation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 