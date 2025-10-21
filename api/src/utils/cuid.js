// api/src/utils/cuid.js
export function cuid () {
    return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
  