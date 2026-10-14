const express = require('express');
const resources = require('../config/resources');
const { createResourceController } = require('../controllers/resourceController');
const { adjustTier } = require('../controllers/subscriptionController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

for (const [path, resource] of Object.entries(resources)) {
  const controller = createResourceController(resource);
  const resourceRouter = express.Router();

  if (path === 'subscriptions') {
    resourceRouter.patch('/:subscriptionId/tier', adjustTier);
  }

  resourceRouter.get('/', asyncHandler(controller.list));
  resourceRouter.post('/', asyncHandler(controller.create));
  resourceRouter.get('/:id', asyncHandler(controller.get));
  resourceRouter.put('/:id', asyncHandler(controller.update));
  resourceRouter.delete('/:id', asyncHandler(controller.remove));

  router.use(`/${path}`, resourceRouter);
}

module.exports = router;
