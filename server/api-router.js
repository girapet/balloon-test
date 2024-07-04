import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

import express from 'express';

import dataStore from './data-store.js';
import imageStore from './image-store.js';

const router = express.Router();

router.post('/add', async (req, res) => {
  const submission = req.body;
  submission.id = crypto.randomUUID();
  
  const { image } = submission;
  submission.hasImage = !!image;

  if (submission.hasImage) {
    delete submission.image;
  }

  await dataStore.add(submission);

  if (submission.hasImage) {
    const imageBuffer = Buffer.from(image, 'base64')
    await imageStore.add(submission.id, imageBuffer);
  }

  res.sendStatus(200);
});

router.get('/list', async (req, res) => {
  const submissions = await dataStore.getAll();
  res.json(submissions);
});

router.get('/image/:id', async (req, res) => {
  const { id } = req.params;
  const image = await imageStore.get(id);
  res.type('image/jpeg');
  res.send(image); 
});

export default router;