const black = '#000'
const white = '#FFF'
const mineShaft = '#333'
const gray = '#828282'
const blackAlpha80 = '#00000080'
const mercury = '#D5D5D5'
const concrete = '#f2f2f2'
const neutral = 'rgba(72, 70, 73, 1)'
const crimsonRed = '#B43F3F'
const green = '#4CAF50'
const red = '#F44336'
const blue = '#2196F3'
const orange = '#FF9800'

export const colors = {
  primary: mineShaft,
  secondary: '#757575',
  text: black,
  textLight: white,
  label: gray,
  title: white,
  background: concrete,
  backgroundLight: white,
  border: mercury,
  card: white,
  modalBackground: blackAlpha80,
  iconLight: white,
  iconDark: black,
  icon: mercury,
  divider: mercury,
  shadow: black,
  underline: neutral,
  alert: crimsonRed,
  snackbar: {
    success: green,
    error: red,
    info: blue,
    warning: orange,
  },
} as const
