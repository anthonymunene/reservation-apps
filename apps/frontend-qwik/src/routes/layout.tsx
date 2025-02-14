import { component$, Slot } from "@builder.io/qwik"
import { type RequestHandler, routeLoader$ } from "@builder.io/qwik-city"
import type { DocumentHead } from "@builder.io/qwik-city"
import Header from "~/components/sidebar"
import Footer from "~/components/starter/footer/footer"

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  })
}

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  }
})

export default component$(() => {
  return (
    <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Header />
      <div class="lg:pl-72">
        <main class="py-10">
          <Slot />
        </main>
        <Footer />
      </div>
    </div>
  )
})

export const head: DocumentHead = ({ head }) => {
  return {
    title: `Reservations - ${head.title}`,
  }
}
