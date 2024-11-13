import { DropAnimation } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export const dropAnimationConfig: DropAnimation = {
  duration: 300,
  keyframes({ transform }) {
    return [
      {
        offset: 0,
        transform: CSS.Transform.toString(transform.initial),
      },
      {
        offset: 1,
        transform: CSS.Transform.toString({
          ...transform.final,
          scaleX: 0.94,
          scaleY: 0.94,
        }),
      },
    ]
  },
  sideEffects({ active }) {
    active.node.style.opacity = '0'

    return () => {
      active.node.style.opacity = ''
    }
  },
}
