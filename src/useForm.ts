import { useCreation } from 'ahooks'
import Joi from 'joi'
import { proxy, ref, useSnapshot } from 'valtio'
import { derive, proxyWithComputed } from 'valtio/utils'
import { createContext, useContext } from 'react'
import {
  FormRegister,
  IFormErrors,
  IUseFormOptions,
  IUseFormReturn,
  RegisterFactoryProps,
} from './types'

const formContext = createContext(null)

export function useProxyForm<T extends {}>(
  options?: IUseFormOptions<T>
): IUseFormReturn<T> {
  //WARN: 鉴于obj一定不会是旧的,有可能会导致错误的重新渲染.
  //有时间调查一下,是否可以改进
  const option = useCreation(() => options, [options])
  const scheme = useCreation(
    () => options?.validateScheme ?? Joi.object(),
    [option]
  )
  //定义Proxy
  const state = useCreation(() => {
    const _s1 = proxyWithComputed(
      {
        formState: options?.initState ?? ({} as T),
        errors: {},
        FormContext: ref(formContext) as unknown as React.Context<
          IUseFormReturn<T>
        >,
        isDirty: false,
      },
      {
        isValid: snap =>
          Object.values(snap.errors).filter(Boolean).length === 0,
      }
    )

    const _s2 = derive(
      {
        register: () =>
          registerFactory<T>({
            state: _s1,
            scheme,
            showErrors: option?.showErrors ?? false,
          }),
        submit: get => () => {
          if (option?.onSubmit) {
            option.onSubmit(get(_s1.formState))
          }
        },
        clear: get => () => {
          const s1 = get(_s1)
          s1.isDirty = false
          s1.formState = option?.initState ?? ({} as T)
        },
      },
      {
        proxy: _s1,
      }
    )

    return _s2
  }, [option])

  return state as IUseFormReturn<T>
}

//register factory
function registerFactory<T extends {}>(
  props: RegisterFactoryProps<T>
): FormRegister<T> {
  const { state, scheme, showErrors } = props
  const { formState, errors } = state

  return (label, options) => {
    const snapState = useSnapshot(formState)
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
        return snapState[key] || ''
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

        if (error && showErrors) console.log(error)

        errors[key] = error?.message
        state.isDirty = true
        //@ts-ignore
        formState[label] = val
      },
    }
  }
}

export function useFormContext<T>(): IUseFormReturn<T> {
  //@ts-ignore
  const f = useContext<IUseFormReturn<T>>(formContext)
  return useSnapshot(f) as IUseFormReturn<T>
}
