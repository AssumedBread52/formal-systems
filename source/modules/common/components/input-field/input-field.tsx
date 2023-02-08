import { Flex } from '@/common/components/flex/flex';
import { Input } from '@/common/components/input/input';
import { Typography } from '@/common/components/typography/typography';
import { InputFieldProps } from '@/common/types';
import { FocusEvent, FormEvent, ReactElement, useState } from 'react';

export const InputField = (props: InputFieldProps): ReactElement => {
  const { label, type, value, hasError, updateValue } = props;

  const [touched, setTouched] = useState<boolean>(false);

  const lowerCaseLabel = label.toLowerCase();
  const id = lowerCaseLabel.split(' ').join('-');

  const blurHandler = (event: FocusEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTouched(true);
  };

  const inputHandler = (event: FormEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    updateValue(event.currentTarget.value);
  };

  const showError = hasError && touched;

  return (
    <Flex display='flex' flexWrap='wrap' justifyContent='space-between' my='1'>
      <Flex flexBasis='25%'>
        <label htmlFor={id}>
          {label}
        </label>
      </Flex>
      <Flex flexBasis='65%'>
        <Input id={id} type={type} width='100%' value={value} onBlur={blurHandler} onInput={inputHandler} />
      </Flex>
      <Typography as='p' color='red' fontSize='0.75rem' height='1rem' width='100%' m='0'>
        {showError && `Please enter a valid ${lowerCaseLabel}.`}
      </Typography>
    </Flex>
  );
};
