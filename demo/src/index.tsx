import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { RxControlError, RxForm, RxInput, RxSelect, RxTextArea, useRxFormGroup, Validators } from '../../src';
import { RenderAsync } from 'react-rx-tools';

const root = createRoot(document.getElementById('demoTest')!);

root.render(<DemoTest/>);

function DemoTest() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [formGroup, onSubmit] = useRxFormGroup({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', Validators.required],
    description: ['', Validators.maxLength(250)],
    sex: ['', Validators.required],
    acceptedTerms: [false, Validators.requiredTrue],
  }, (value) => {
    console.log(value);
  });

  return <RxForm formGroup={formGroup} onSubmit={onSubmit}>
    <div>
      <label>
        <span>Email:</span>
        <RxInput type="email" formControlName="email"/>
      </label>
      <RxControlError formControlName="email">
        {error => error && <span>{JSON.stringify(error)}</span>}
      </RxControlError>
    </div>
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
        <RxSelect ref={selectRef} formControlName="sex">
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
      <button type="submit">Submit</button>
    </div>
    <RenderAsync source={formGroup.value$} definedOnly>
      {value => <pre>{JSON.stringify(value, null, 4)}</pre>}
    </RenderAsync>
  </RxForm>;
}
