import Joi from 'joi'
import React from 'react'

export interface State {
  //boolean真的可以吗,存疑
  [label: string]: string | number | boolean
}

export interface IUseFormOptions<T extends State> {
  initState?: T
  //joi scheme
  validateScheme?: Joi.ObjectSchema<T>
  onSubmit?: (state: T) => void
}

export interface IUseFormReturn<T> {
  formState: T
  errors: IFormErrors<T>
  register: FormRegister<T>
  isValid: boolean
  submit: () => void
}

export interface IUseFormReturnEX<T> extends IUseFormReturn<T> {
  FormContext: React.Context<IUseFormReturn<T>>
}
export interface RegisterFactoryProps<T> {
  formState: T
  errors: IFormErrors<T>
  scheme: Joi.ObjectSchema<T>
}

export interface IFormRegisterOptions {
  condition?: (value: string) => boolean
}

export type IFormErrors<T> = {
  [key in keyof T]?: string
}

export type FormRegister<T> = (
  label: keyof T extends never ? string : keyof T,
  options?: IFormRegisterOptions
) => void

export interface FormRegisterReturn {
  value: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
