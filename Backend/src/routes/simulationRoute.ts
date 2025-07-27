import { Router } from 'express';
import {
  createSimulation,
  getSimulations,
  getSimulationById,
  updateSimulation,
  deleteSimulation,
} from "../controllers/simulationController"

const router = Router();

router.post('/', createSimulation);
router.get('/', getSimulations);
router.get('/:id', getSimulationById);
router.put('/:id', updateSimulation);
router.delete('/:id', deleteSimulation);

export default router;
