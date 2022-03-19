import Joi from 'joi'
import React from 'react'

export interface State {
  //boolean真的可以吗,存疑
  [label: string]: string | number | boolean
}

export interface IUseFormOptions<T> {
  initState?: T
  //joi scheme
  validateScheme?: Joi.ObjectSchema<T>
  onSubmit?: (state: T) => void
  //是否开启console显示errors信息
  showErrors?: boolean
}

//基本类型,用来给register提供类型
interface BaseFormReturn<T> {
  formState: T
  errors: IFormErrors<T>
  isValid: boolean
  isDirty: boolean
  FormContext: React.Context<IUseFormReturn<T>>
}

//派生返回类型
export interface IUseFormReturn<T> extends BaseFormReturn<T> {
  register: FormRegister<T>
  submit: () => void
  clear: () => void
}

export interface RegisterFactoryProps<T> {
  state: BaseFormReturn<T>
  scheme: Joi.ObjectSchema<T>
  showErrors?: boolean

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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => never
}
