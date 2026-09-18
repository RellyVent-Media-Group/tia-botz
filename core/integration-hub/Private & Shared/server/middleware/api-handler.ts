import { getContentCalendar, getCharacters, getAnalytics, storeEngagement } from '../../src/lib/api-server';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event).pathname;

  // Content Calendar API
  if (url.startsWith('/api/content-calendar') && getMethod(event) === 'GET') {
    try {
      const data = getContentCalendar();
      return data;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch content calendar'
      });
    }
  }

  // Characters API
  if (url.startsWith('/api/characters') && getMethod(event) === 'GET') {
    try {
      const data = getCharacters();
      return data;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch characters'
      });
    }
  }

  // Analytics API
  if (url.startsWith('/api/analytics') && getMethod(event) === 'GET') {
    try {
      const data = getAnalytics();
      return data;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch analytics'
      });
    }
  }

  // Engagement API
  if (url.startsWith('/api/engagement') && getMethod(event) === 'POST') {
    try {
      const body = await readBody(event);
      const result = storeEngagement(body);
      return result;
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to store engagement data'
      });
    }
  }
});