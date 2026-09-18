import { express } from 'express';
import { getContentCalendar, getCharacters, getAnalytics, storeEngagement } from '../src/lib/api-server';

export function setupApiRoutes(app: any) {
  // Content Calendar API
  app.get('/api/content-calendar', (req: any, res: any) => {
    try {
      const data = getContentCalendar();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch content calendar' });
    }
  });

  // Characters API
  app.get('/api/characters', (req: any, res: any) => {
    try {
      const data = getCharacters();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  // Analytics API
  app.get('/api/analytics', (req: any, res: any) => {
    try {
      const data = getAnalytics();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Engagement API
  app.post('/api/engagement', (req: any, res: any) => {
    try {
      const result = storeEngagement(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to store engagement data' });
    }
  });
}