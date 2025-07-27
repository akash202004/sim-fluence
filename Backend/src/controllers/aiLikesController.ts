import axios from 'axios';
import { Request, Response } from 'express';

// POST /api/ai/likes
export const getAiLikes = async (req: Request, res: Response) => {
  try {
    // The data sent from the frontend after simulation
    const simulationData = req.body;

    // Call the AI Python service (adjust the URL/port as needed)
    const aiResponse = await axios.post('http://localhost:5000/predict-likes', simulationData);

    // Return the AI's prediction to the frontend
    res.status(200).json({ likes: aiResponse.data.likes });
  } catch (error: any) {
    console.error('Error fetching AI likes:', error.message);
    res.status(500).json({ error: 'Failed to get AI likes prediction' });
  }
}; 