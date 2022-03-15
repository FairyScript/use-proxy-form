import Joi from 'joi'

declare interface IUseFormOptions<T> {
  initState?: T
  //joi scheme
  validateScheme?: Joi.ObjectSchema<T>
  onSubmit?: (state: T) => void
}

declare interface IUseFormReturn<T> {
  formState: T
  errors: IFormErrors<T>
  register: FormRegister<T>
  isValid: boolean
  submit: () => void
}

declare interface RegisterFactoryProps<T> {
  formState: T
  errors: IFormErrors<T>
  scheme: Joi.ObjectSchema<T>
}

declare interface IFormRegisterOptions {
  condition?: (value: string) => boolean
}

declare type IFormErrors<T> = {
  [key in keyof T]?: string
}

declare type FormRegister<T> = (
  label: keyof T extends never ? string : keyof T,
  options?: IFormRegisterOptions
) => void

declare interface FormRegisterReturn {
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
