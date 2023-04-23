export type NumericSelectFieldProps = {
  label: string;
  total: number;
  interval: number;
  optionCount: number;
  value: number;
  setValue: (newValue: number) => void;
};
