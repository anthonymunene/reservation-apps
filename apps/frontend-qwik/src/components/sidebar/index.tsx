import { $, component$ } from "@builder.io/qwik"
import { useNavigate } from "@builder.io/qwik-city"
import { QwikLogo } from "../starter/icons/qwik"
import { logOut, useAuth } from "~/utils/auth"

const linkClass =
  "bg-gray-800 text-white group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"

export default component$(() => {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogOut = $(async () => {
    await logOut()
    auth.user = null
    await navigate("/login/")
  })

  return (
    <header class="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center">
          <a href="/" title="qwik">
            <QwikLogo />
          </a>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul class="flex flex-1 flex-col gap-y-7">
            <li>
              <a class={linkClass} href="/users">
                Users
              </a>
            </li>
            <li>
              <a class={linkClass} href="/properties">
                Properties
              </a>
            </li>
            {/* Nothing is shown until the browser has checked for a saved session */}
            {auth.checked && (
              <li class="mt-auto" data-testid="auth-status">
                {auth.user ? (
                  <div class="flex flex-col gap-y-2">
                    <a
                      class="truncate text-sm text-gray-300"
                      href={`/users/${auth.user.id}/`}
                      data-testid="signed-in-as"
                    >
                      Signed in as {auth.user.email}
                    </a>
                    <button type="button" class={linkClass} onClick$={handleLogOut}>
                      Log out
                    </button>
                  </div>
                ) : (
                  <a class={linkClass} href="/login/">
                    Log in
                  </a>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
})
