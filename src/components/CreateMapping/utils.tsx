import _ from 'lodash'

export function isFormChanged(current, initial) {
  return !_.isEqual(current, initial)
}

export const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => res.json())
