import { EPaymentMethod } from '@/api/models/order'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CustomerInfo {
  fullName: string
  phone: string
  email: string
  note: string
}

export interface AddressInfo {
  province: string
  ward: string
  address: string
}

export type PaymentMethod = 'cod' | 'bank'

export interface CheckoutData {
  customerInfo: CustomerInfo
  addressInfo: AddressInfo
  paymentMethod: EPaymentMethod
}

export const useCheckoutStore = defineStore('checkout', () => {
  const customerInfo = ref<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    note: '',
  })

  const addressInfo = ref<AddressInfo>({
    province: '',
    ward: '',
    address: '',
  })

  const paymentMethod = ref<EPaymentMethod>(EPaymentMethod.CASH)

  // Update customer info
  const setCustomerInfo = (info: Partial<CustomerInfo>) => {
    customerInfo.value = { ...customerInfo.value, ...info }
  }

  // Update address info
  const setAddressInfo = (info: Partial<AddressInfo>) => {
    addressInfo.value = { ...addressInfo.value, ...info }
  }

  // Update payment method
  const setPaymentMethod = (method: EPaymentMethod) => {
    paymentMethod.value = method
  }

  // Get all checkout data
  const getCheckoutData = (): CheckoutData => {
    return {
      customerInfo: customerInfo.value,
      addressInfo: addressInfo.value,
      paymentMethod: paymentMethod.value,
    }
  }

  // Reset all data
  const resetCheckout = () => {
    customerInfo.value = {
      fullName: '',
      phone: '',
      email: '',
      note: '',
    }
    addressInfo.value = {
      province: '',
      ward: '',
      address: '',
    }
    paymentMethod.value = EPaymentMethod.CASH
  }

  // Validate all required fields
  const isCheckoutValid = (): boolean => {
    const { fullName, phone, email } = customerInfo.value
    const { province, ward, address } = addressInfo.value

    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    const isValidPhone = (phone: string): boolean => {
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
      return phoneRegex.test(phone)
    }

    return (
      fullName?.trim().length >= 3 &&
      isValidPhone(phone) &&
      isValidEmail(email) &&
      province !== '' &&
      ward !== '' &&
      address?.trim().length >= 5
    )
  }

  return {
    customerInfo,
    addressInfo,
    paymentMethod,
    setCustomerInfo,
    setAddressInfo,
    setPaymentMethod,
    getCheckoutData,
    resetCheckout,
    isCheckoutValid,
  }
})
