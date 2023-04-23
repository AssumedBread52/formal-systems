export type MutationPageProps = {
  title: string;
  disableSubmit?: boolean;
  submitTitle: string;
  isLoading: boolean;
  errorMessage: string;
  onSubmit: () => void;
};
