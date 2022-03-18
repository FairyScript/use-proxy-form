import { useCreation } from 'ahooks'
import Joi from 'joi'
import { proxy, useSnapshot } from 'valtio'
import { createContext, useContext } from 'react'
import {
  FormRegister,
  IFormErrors,
  IUseFormOptions,
  IUseFormReturn,
  IUseFormReturnEX,
  RegisterFactoryProps,
  State,
} from './types'

const formContext = createContext(null)

export function useProxyForm<T extends {}>(
  options?: IUseFormOptions<T>
): IUseFormReturnEX<T> {
  //WARN: 鉴于obj一定不会是旧的,有可能会导致错误的重新渲染.
  //有时间调查一下,是否可以改进
  const option = useCreation(() => options, [options])
  //定义Proxy
  const state = useCreation(
    () => proxy<T>(options?.initState ?? ({} as T)),
    [option]
  )
  const errors = useCreation(() => proxy<IFormErrors<T>>({}), [])
  const scheme = useCreation(
    () => options?.validateScheme ?? Joi.object(),
    [option]
  )

  const result = useCreation(
    () => ({
      formState: state,
      errors: errors,
      register: registerFactory({
        formState: state,
        errors: errors,
        scheme: scheme,
      }),
      FormContext: formContext as unknown as React.Context<IUseFormReturn<T>>,
      isValid: Object.keys(errors).length === 0,
      //submit
      submit: () => {
        if (options?.onSubmit) {
          options.onSubmit(state)
        }
      },
    }),
    [option]
  ) as IUseFormReturnEX<T>

  return result
}

//register factory
function registerFactory<T extends {}>(
  props: RegisterFactoryProps<T>
): FormRegister<T> {
  const { formState, errors, scheme } = props
  return (label, options) => {
    const state = useSnapshot(formState)
    const key = label as keyof T

    //初始化state
    if (formState[key] === undefined) {
      //@ts-ignore
      formState[key] = ''
    }
    return {
      get value() {
        //给一个初始化值,防止uncontroll
        //@ts-ignore
        return state[key] || ''
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        let val: any = e.target.value
        //输入过滤,注意这是对value的直接过滤,不是对scheme的过滤
        //如果是true,会阻止更新input的value
        //value 为空直接跳过
        if (options?.condition && val !== '' && !options.condition(val)) {
          return
        }

        //用scheme做自动类型转换
        //警告: 当scheme为 number 的时候,会有意外的数字去0问题,需要在scheme中自行处理
        const res = scheme.validate(
          { [label]: val },
          {
            abortEarly: false,
          }
        )

        val = res.value![key]

        //handle error message
        const error = res.error?.details?.find(item => item.path[0] === key)

        if (error) console.log(error)

        errors[key] = error?.message
        //@ts-ignore
        formState[label] = val
      },
    }
  }
}

export function useFormContext<T>() {
  //@ts-ignore
  return useContext<IUseFormReturn<T>>(formContext)
}