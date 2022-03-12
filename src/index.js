import './style.scss'
import a from './assets/img/avatar.jpg'
console.log(a)
console.log(111)

document.addEventListener('click', () => {
  console.log(12580)
})

const waitTime = (delay = 300) => new Promise((resolve) => setTimeout(resolve, delay))

waitTime(4396).then(async () => {
  await waitTime(7777)
  console.log(9527)
})
