const BASE_URL = 'https://your-energy.b.goit.study/api';

async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = new Error(`API error: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getQuote() {
  return fetchApi('/quote');
}

export async function getFilters(filter) {
  const params = new URLSearchParams({ filter });
  return fetchApi(`/filters?${params}`);
}

export async function getExercises(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.bodypart) searchParams.set('bodypart', params.bodypart);
  if (params.muscles) searchParams.set('muscles', params.muscles);
  if (params.equipment) searchParams.set('equipment', params.equipment);
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  const query = searchParams.toString();
  return fetchApi(`/exercises${query ? `?${query}` : ''}`);
}

export async function getExerciseById(id) {
  return fetchApi(`/exercises/${id}`);
}

export async function patchExerciseRating(id, rating) {
  return fetchApi(`/exercises/${id}/rating`, {
    method: 'PATCH',
    body: JSON.stringify({ rating }),
  });
}

export async function postSubscription(email) {
  return fetchApi('/subscription', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
