import { Router } from 'express';
import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';

const router = Router();

const DEFAULT_RECIPES = [
  {
    id: 'standard_default',
    name: 'Standard',
    description: 'Balanced context for general use',
    layerWeights: { identity_core: 1.0, global_prefs: 1.0, topic: 1.0, entity: 1.0, conversation: 1.0 },
    excludedLayers: [],
    customBudget: 12000,
    isDefault: true,
  },
  {
    id: 'research_deep',
    name: 'Deep Research',
    description: 'Maximize topic/entity context for research',
    layerWeights: { identity_core: 0.5, topic: 1.5, entity: 1.5, conversation: 0.5, global_prefs: 0.8 },
    excludedLayers: [],
    customBudget: 20000,
    isDefault: true,
  },
  {
    id: 'creative_flexible',
    name: 'Creative',
    description: 'Flexible context for creative work',
    layerWeights: { identity_core: 1.2, global_prefs: 1.2, topic: 0.8, entity: 0.8, conversation: 1.0 },
    excludedLayers: [],
    customBudget: 15000,
    isDefault: true,
  },
];

async function seedDefaultRecipes() {
  const prisma = getPrismaClient();
  for (const recipe of DEFAULT_RECIPES) {
    await prisma.contextRecipe.upsert({
      where: { id: recipe.id },
      update: {},
      create: recipe,
    });
  }
  logger.info('Default context recipes seeded');
}

seedDefaultRecipes();

// Middleware to extract user ID (assuming standard auth or passing in headers for now)
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
  }
  req.userId = userId;
  next();
};

/**
 * Get all recipes for a user (and system defaults)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const recipes = await prisma.contextRecipe.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { userId: null, isDefault: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ recipes });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to list recipes');
    res.status(500).json({ error: 'Failed to list recipes' });
  }
});

/**
 * Get a specific recipe
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const recipe = await prisma.contextRecipe.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId },
          { userId: null, isDefault: true }
        ]
      }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ recipe });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get recipe');
    res.status(500).json({ error: 'Failed to get recipe' });
  }
});

/**
 * Create a new recipe
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { name, description, layerWeights, excludedLayers, customBudget } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const recipe = await prisma.contextRecipe.create({
      data: {
        name,
        description,
        layerWeights: layerWeights || {},
        excludedLayers: excludedLayers || [],
        customBudget: customBudget || null,
        userId: req.userId,
        isDefault: false
      }
    });

    res.status(201).json({ recipe });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to create recipe');
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

/**
 * Update a recipe
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const { name, description, layerWeights, excludedLayers, customBudget } = req.body;

    // Check ownership
    const existing = await prisma.contextRecipe.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Recipe not found or access denied' });
    }

    const recipe = await prisma.contextRecipe.update({
      where: { id: req.params.id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        layerWeights: layerWeights !== undefined ? layerWeights : existing.layerWeights,
        excludedLayers: excludedLayers !== undefined ? excludedLayers : existing.excludedLayers,
        customBudget: customBudget !== undefined ? customBudget : existing.customBudget
      }
    });

    res.json({ recipe });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to update recipe');
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

/**
 * Delete a recipe
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const prisma = getPrismaClient();
    
    // Check ownership
    const existing = await prisma.contextRecipe.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Recipe not found or access denied' });
    }

    await prisma.contextRecipe.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to delete recipe');
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
