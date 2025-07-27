import { Router } from 'express';
import {
  createSimulation,
  getSimulations,
  getSimulationById,
  updateSimulation,
  deleteSimulation,
  startSimulationWithUpload,
  updateSimulationStatus,
} from "../controllers/simulationController"

const router = Router();

router.post('/', createSimulation);
router.post('/start', startSimulationWithUpload);
router.get('/', getSimulations);
router.get('/:id', getSimulationById);
router.put('/:id', updateSimulation);
router.patch('/:id/status', updateSimulationStatus);
router.delete('/:id', deleteSimulation);

export default router;
