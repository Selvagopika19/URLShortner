/**
 * Turns axios/fetch failures into a single user-facing string.
 * Handles: API offline, HTTP status codes, Express-validator arrays, plain text bodies.
 */
export function getRequestErrorMessage(error) {
  const err = error;

  // Browser / axios with no HTTP response (server down, CORS misconfig, wrong URL)
  if (!err.response) {
    const code = err.code;
    const msg = err.message || '';

    if (code === 'ECONNABORTED' || msg.includes('timeout')) {
      return 'Request timed out. Check your network and that the API is running.';
    }
    if (
      code === 'ERR_NETWORK' ||
      code === 'ECONNREFUSED' ||
      msg === 'Network Error' ||
      msg.includes('Network Error')
    ) {
      return 'Cannot reach the API. Start the backend on port 5000: open a terminal in the server folder and run npm run dev — or from the project root run npm run dev to start both API and this app. Then refresh this page.';
    }

    return msg || 'No response from server. Is the API running?';
  }

  const status = err.response.status;
  const data = err.response.data;

  let message =
    (typeof data === 'object' && data !== null && data.message) ||
    (typeof data === 'string' ? data : null);

  // express-validator style: { errors: [{ msg: '...' }] }
  if (typeof data === 'object' && data?.errors && Array.isArray(data.errors)) {
    const parts = data.errors.map((e) => e.msg || e.message || String(e)).filter(Boolean);
    if (parts.length) message = parts.join(' ');
  }

  if (typeof message === 'string' && (message.trim().startsWith('<') || message.includes('<!DOCTYPE'))) {
    return 'Cannot reach the API (got an HTML error page). Start the backend on port 5000, then try again.';
  }

  if (status === 401) {
    return (
      message ||
      'Invalid email or password. If you just signed up, use the same email and password, or create an account first.'
    );
  }
  if (status === 403) {
    return message || 'You do not have permission for this action.';
  }
  if (status === 404) {
    return message || 'Not found.';
  }
  if (status === 409) {
    return message || 'This email is already registered. Sign in instead.';
  }
  if (status === 400) {
    return message || 'Invalid input. Check your entries and try again.';
  }
  if (status === 429) {
    return message || 'Too many requests. Wait a moment and try again.';
  }
  if (status >= 500) {
    return message || 'Server error. Try again in a moment.';
  }

  return message || `Request failed (${status}).`;
}
