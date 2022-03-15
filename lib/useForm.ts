import { useCreation } from 'ahooks'
import Joi from 'joi'
import { proxy, useSnapshot } from 'valtio'
import { derive } from 'valtio/utils'
import {
  IUseFormOptions,
  IUseFormReturn,
  IFormErrors,
  RegisterFactoryProps,
  FormRegister,
} from './types'

export function useProxyForm<T extends object>(
  options?: IUseFormOptions<T>
): IUseFormReturn<T> {
  const option = useCreation(() => options, [])
  //定义Proxy
  const state = useCreation(
    () => proxy<T>(options?.initState ?? ({} as T)),
    [option]
  )
  const errors = useCreation(() => proxy<IFormErrors<T>>({}), [])
  const scheme = useCreation(() => options.validateScheme ?? Joi.object(), [])

  const result = useCreation(
    () =>
      derive({
        formState: get => get(state),
        errors: get => get(errors),
        register: get =>
          registerFactory({
            formState: get(state),
            errors: get(errors),
            scheme: get(scheme),
          }),
        isValid: get => Object.keys(get(errors)).length === 0,
        //submit 
        submit: get => () => {
          if (options?.onSubmit) {
            options.onSubmit(get(state))
          }
        },
      }),
    [option]
  )
  return result
}

//register factory
function registerFactory<T extends object>(
  props: RegisterFactoryProps<T>
): FormRegister<T> {
  const { formState, errors, scheme } = props
  const state = useSnapshot<T>(formState)
  return (label, options) => {
    const key = label as keyof T
    return {
      get value() {
        if (formState[key] === undefined) {
          //如果没有设置初始值，则返回空字符串
          //提前赋值,防止出现非受控组件
          formState[key as string] = ''
        }
        return formState[key]
      },
      onChange: e => {
        let val: any = e.target.value
        //输入过滤,注意这是对value的直接过滤,不是对scheme的过滤
        //如果是true,会阻止更新input的value
        if (options?.condition && !options.condition(val)) {
          return
        }

        //用scheme做自动类型转换
        //警告: 当scheme为 number 的时候,会有意外的数字去0问题,需要在scheme中自行处理
        const res = scheme.validate({ [label]: val })

        val = res.value[key]
        errors[key] = res.error?.message

        //@ts-ignore
        state[label] = val
      },
    }
  }
}

const { register } = useProxyForm({
  initState: {
    //a:''
  },
})

register('sa')
