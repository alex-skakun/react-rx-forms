import {
  PropsWithChildren,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRxFormControl, useRxFormGroup } from 'react-rx-forms';

interface SignInFormProps {
  onSignIn: (token: string) => void;
}

function SignInForm({onSignIn}: SignInFormProps) {
  const form = useRxFormGroup({
    email: 123,
    password: '',
    address: useRxFormGroup({
      country: '',
      city: '',
    }),
  });
  const email = useRxFormControl([[123]]);

  email.reset();
  email.value;
  email.value$.subscribe((value) => {

  });
  const onSubmit = useCallback((value) => {

  }, []);

  return <Form formGroup={form} onSubmit={onSubmit}>
    <Input type="email" formControlName="email" />
    <Input type="password" formControlName="password" />

    <FormControlContext formControlName="email">
      {(control) => <>
        {control.invalid && <span>hfku</span>}
      </>}
    </FormControlContext>

    <button disabled={form.inProgress} type="submit">Sign In</button>
  </Form>;
}

function FormControlContext({formControlName, children}: { formControlName: string, children: (state: any) => ReactNode }) {
  const form = useContext(FormContext);
  const control = form.controls.get(formControlName);
  const [controlSatate, setControlState] = useState(control.state);

  useEffect(() => {
    const subscribtion = control.state$.subscribe(state => setControlState(state));

    return () => subscribtion.unsubscribe();
  }, []);

  return <>{children(controlSatate)}</>
}


