export type Sensor = {
  temperaturaAr: number
  umidadeSolo: number
  luminosidade: number
  criadoEm: string
}

export type Dispositivo = {
  id: string
  nome: string
  sensores: Sensor[]
}

export type Usuario = {
  id: string
  nome: string
  email: string
  dispositivos: Dispositivo[]
}
