import _ from 'lodash'

export function isFormChanged(current, initial) {
  return !_.isEqual(current, initial)
}

export const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
