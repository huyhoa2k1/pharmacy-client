import { driver, type Driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useI18n } from 'vue-i18n'

export type TourName = 'home' | 'product' | 'cart'

interface TourStepDef {
  target: string
  key: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_VERSION = 'v1'
const storageKey = (name: TourName) => `pharmacy_tour_${name}_${TOUR_VERSION}`

const TOURS: Record<TourName, TourStepDef[]> = {
  home: [
    { target: 'header-search', key: 'search', side: 'bottom' },
    { target: 'navbar', key: 'navbar', side: 'bottom' },
    { target: 'home-categories', key: 'categories', side: 'top' },
    { target: 'home-flash-sale', key: 'flashSale', side: 'top' },
    { target: 'home-best-sellers', key: 'bestSellers', side: 'top' },
    { target: 'header-cart', key: 'cart', side: 'bottom' },
    { target: 'header-account', key: 'account', side: 'bottom' },
    { target: 'header-language', key: 'language', side: 'bottom' },
    { target: 'chat', key: 'chat', side: 'left' },
  ],
  product: [
    { target: 'product-quantity', key: 'quantity', side: 'left' },
    { target: 'product-add-to-cart', key: 'addToCart', side: 'left' },
    { target: 'product-buy-now', key: 'buyNow', side: 'left' },
    { target: 'header-cart', key: 'cart', side: 'bottom' },
  ],
  cart: [
    { target: 'cart-items', key: 'items', side: 'right' },
    { target: 'cart-promotion', key: 'promotion', side: 'left' },
    { target: 'cart-checkout', key: 'checkout', side: 'left' },
  ],
}

// route name -> tour, used by the header help button
const ROUTE_TOURS: Record<string, TourName> = {
  home: 'home',
  'product-detail': 'product',
  cart: 'cart',
}

export const getTourForRoute = (routeName: unknown): TourName | undefined =>
  typeof routeName === 'string' ? ROUTE_TOURS[routeName] : undefined

let activeDriver: Driver | null = null

// fixed-position elements have no offsetParent, so test rendered boxes instead
const isVisible = (el: Element) => el.getClientRects().length > 0

export const useTour = () => {
  const { t } = useI18n()

  const hasSeen = (name: TourName) => localStorage.getItem(storageKey(name)) === '1'

  const startTour = (name: TourName) => {
    activeDriver?.destroy()

    const steps: DriveStep[] = TOURS[name].flatMap(({ target, key, side }) => {
      const selector = `[data-tour="${target}"]`
      const el = document.querySelector(selector)
      if (!el || !isVisible(el)) return []
      return [
        {
          element: selector,
          popover: {
            title: t(`tour.${name}.${key}.title`),
            description: t(`tour.${name}.${key}.desc`),
            side,
            align: 'center',
          },
        },
      ]
    })

    if (steps.length === 0) return

    activeDriver = driver({
      steps,
      animate: true,
      showProgress: true,
      allowClose: true,
      disableActiveInteraction: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      nextBtnText: t('tour.buttons.next'),
      prevBtnText: t('tour.buttons.prev'),
      doneBtnText: t('tour.buttons.done'),
      progressText: '{{current}} / {{total}}',
      onPopoverRender: (popover, { state }) => {
        popover.nextButton.classList.toggle(
          'driver-popover-done-btn',
          state.activeIndex === steps.length - 1,
        )
      },
      onDestroyed: () => {
        localStorage.setItem(storageKey(name), '1')
        activeDriver = null
      },
    })
    activeDriver.drive()
  }

  const startTourIfFirstVisit = (name: TourName) => {
    if (!hasSeen(name)) startTour(name)
  }

  return { startTour, startTourIfFirstVisit, hasSeen }
}
