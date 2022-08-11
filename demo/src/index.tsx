import { createRoot } from 'react-dom/client';
import {
  createRxFormGroup,
  RxControlError,
  RxForm, RxFormArray, RxFormArrayConsumer, RxFormGroupConsumer,
  RxFormContext,
  RxInput,
  RxSelect,
  RxTextArea,
  useRxFormArray,
  useRxFormGroup,
  Validators, RxFormGroup,
} from '../../src';
import { Render$ } from 'react-rx-tools';
import { useFunction } from 'react-cool-hooks';
import { take, tap, timer } from 'rxjs';

const root = createRoot(document.getElementById('demoTest')!);

root.render(<DemoTest/>);

interface Address {
  city: string;
  country: string;
  zip: string;
  line: string;
}

function DemoTest() {
  const addresses = useRxFormArray<Address>([]);
  const [formGroup, onSubmit] = useRxFormGroup({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', Validators.required],
    description: ['', Validators.maxLength(250)],
    sex: ['', Validators.required],
    acceptedTerms: [false, Validators.requiredTrue],
    addresses,
  }, (value) => {
    return timer(1000).pipe(
      take(1),
      tap(() => console.log(value)),
    );
  });

  formGroup.controls.email

  const onAddAddress = useFunction(() => {
    addresses.addControl(createRxFormGroup<Address>({
      city: ['', Validators.required],
      country: ['', Validators.required],
      zip: ['', Validators.required],
      line: ['', Validators.required],
    }));
  });

  const onRemoveAddress = useFunction((control: RxFormGroup<Address>) => {
    addresses.removeControl(control);
  });

  return <RxForm formGroup={formGroup} onSubmit={onSubmit}>
    <InputItem formControlName="email" label="Email">
      {(name, id) => (
        <RxInput type="email" formControlName={name} id={id}/>
      )}
    </InputItem>
    <div>
      <label>
        <span>First name:</span>
        <RxInput formControlName="firstName"/>
      </label>
      <RxControlError formControlName="firstName">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <span>Last name:</span>
        <RxInput formControlName="lastName"/>
      </label>
      <RxControlError formControlName="lastName">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <span>Password:</span>
        <RxInput formControlName="password"/>
      </label>
      <RxControlError formControlName="password">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <span>Description:</span>
        <RxTextArea formControlName="description"/>
      </label>
      <RxControlError formControlName="description">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <span>Sex:</span>
        <RxSelect formControlName="sex">
          <option value="">Select...</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </RxSelect>
      </label>
      <RxControlError formControlName="sex">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <fieldset>
          <legend>Sex:</legend>
          <RxInput type="radio" value="M" formControlName="sex"/>
          <RxInput type="radio" value="F" formControlName="sex"/>
        </fieldset>
      </label>
      <RxControlError formControlName="sex">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <label>
        <span>Terms:</span>
        <RxInput type="checkbox" formControlName="acceptedTerms"/>
      </label>
      <RxControlError formControlName="acceptedTerms">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
    <div>
      <RxFormArrayConsumer arrayName="addresses">
        {(array: RxFormArray<Address, RxFormGroup<Address>>) => array.controls.map((control, index) => (
          <div key={index}>
            <RxFormGroupConsumer group={control}>
              <InputItem formControlName="city" label="City">
                {(name, id) => <RxInput formControlName={name} id={id} />}
              </InputItem>
              <InputItem formControlName="country" label="Country">
                {(name, id) => <RxInput formControlName={name} id={id} />}
              </InputItem>
              <InputItem formControlName="zip" label="ZIP">
                {(name, id) => <RxInput formControlName={name} id={id} />}
              </InputItem>
              <InputItem formControlName="line" label="Line">
                {(name, id) => <RxInput formControlName={name} id={id} />}
              </InputItem>
            </RxFormGroupConsumer>
            <button type="button" onClick={() => onRemoveAddress(control)}>Remove</button>
          </div>
        ))}
      </RxFormArrayConsumer>
      <button type="button" onClick={onAddAddress}>Add</button>
    </div>
    <div>
      <RxFormContext.Consumer>
        {([context]) => (
          <button type="submit" disabled={context?.progress || !context?.valid}>Submit</button>
        )}
      </RxFormContext.Consumer>
    </div>
    <Render$ $={formGroup.value$} definedOnly>
      {value => <pre>{JSON.stringify(value, null, 4)}</pre>}
    </Render$>
  </RxForm>;
}

type InputItemProps = {
  formControlName: string;
  label: string;
  children: (name: string, id: string) => JSX.Element;
}

function InputItem({ formControlName, label, children }: InputItemProps): JSX.Element {
  const id = `${formControlName}Input`;

  return <div>
    <div>
      <label htmlFor={id}>{label}:</label>
    </div>
    <div>
      <div>
        {children(formControlName, id)}
      </div>
      <div>
        <RxControlError formControlName={formControlName}>
          {error => !!error && (
            <span data-error-type={error.validatorName}>{JSON.stringify(error)}</span>
          )}
        </RxControlError>
      </div>
    </div>
  </div>
}
