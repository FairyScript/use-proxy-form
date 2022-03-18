import Joi from 'joi'
import { useFormContext, useProxyForm } from '../lib/useForm'

export default function App() {
  return (
    <div>
      <h1>Hello!</h1>
      <FormExample />
    </div>
  )
}

const FormExample: React.FC = () => {
  const f = useProxyForm({
    validateScheme: Joi.object({
      a: Joi.string().required().messages({
        'string.empty': 'a 是必填项',
      }),
      b: Joi.string().required().min(4).max(9),
      c: Joi.string().required(),
    }),
  })

  console.log('f render');
  
  return (
    <f.FormContext.Provider value={f}>
      <Input label="a" />
      <Input label="b" />
      <Input label="c" />
    </f.FormContext.Provider>
  )
}

const Input: React.FC<{ label: string }> = ({ label }) => {
  const { register, errors } = useFormContext<Record<any, string>>()

  return (
    <div>
      <div>
        <span>{label}</span>
      </div>
      <input type="text" {...register(label)} />
      <span>{errors[label]}</span>
    </div>
  )
}
