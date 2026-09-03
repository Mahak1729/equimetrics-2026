import { useEffect, useState } from 'react';

// Module-level cache so revisiting a page does not re-show a skeleton for data
// we already have. The dataset files under /data are static, so this is safe
// for the lifetime of the tab.
const cache = new Map();

function initialState(url, fallback) {
  return cache.has(url)
    ? { data: cache.get(url), loading: false, error: null }
    : { data: fallback, loading: true, error: null };
}

/**
 * Fetches a static JSON file and reports load state.
 *
 * Returns { data, loading, error, retry }. `data` holds the fallback until the
 * request resolves, so a caller can render its normal layout throughout and
 * simply show a skeleton while `loading` is true.
 */
export function useJSON(url, fallback = null) {
  // Captured once so an inline literal (e.g. `useJSON(url, [])`) does not
  // produce a new identity on every render.
  const [emptyValue] = useState(fallback);

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState(() => initialState(url, emptyValue));

  // Reset during render when the request identity changes. This is the
  // React-sanctioned alternative to resetting inside an effect.
  const key = `${url}|${attempt}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setState(initialState(url, emptyValue));
  }

  useEffect(() => {
    // Resolved synchronously from cache by initialState; nothing to fetch.
    if (cache.has(url)) return;

    let cancelled = false;
    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then(json => {
        if (cancelled) return;
        cache.set(url, json);
        setState({ data: json, loading: false, error: null });
      })
      .catch(err => {
        if (cancelled || err.name === 'AbortError') return;
        setState({ data: emptyValue, loading: false, error: err });
      });

    return () => { cancelled = true; controller.abort(); };
  }, [url, attempt, emptyValue]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    retry: () => setAttempt(a => a + 1),
  };
}
