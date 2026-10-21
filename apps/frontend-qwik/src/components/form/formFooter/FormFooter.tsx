import { type FormStore } from "@modular-forms/qwik"
import { ActionButton } from "../../ActionButton"

type FormFooterProps = {
  of: FormStore<any, any>
  form?: string
}

/**
 * Form footer with the submit button.
 */
export function FormFooter({ form }: FormFooterProps) {
  return (
    <footer class="flex space-x-6 px-8 md:space-x-8">
      <ActionButton variant="primary" label="Sign in" type="submit" form={form} />
    </footer>
  )
}
