<template>
  <footer class="footer">
    <div class="footer__assurance">
      <div class="footer__container footer__assurance-grid">
        <div class="footer__assurance-item">
          <span class="footer__assurance-icon"><i class="pi pi-verified"></i></span>
          <div>
            <strong>{{ t('footer.assuranceGenuineTitle') }}</strong>
            <span>{{ t('footer.assuranceGenuineDesc') }}</span>
          </div>
        </div>
        <div class="footer__assurance-item">
          <span class="footer__assurance-icon"><i class="pi pi-truck"></i></span>
          <div>
            <strong>{{ t('footer.assuranceDeliveryTitle') }}</strong>
            <span>{{ t('footer.assuranceDeliveryDesc') }}</span>
          </div>
        </div>
        <div class="footer__assurance-item">
          <span class="footer__assurance-icon"><i class="pi pi-shield"></i></span>
          <div>
            <strong>{{ t('footer.assurancePaymentTitle') }}</strong>
            <span>{{ t('footer.assurancePaymentDesc') }}</span>
          </div>
        </div>
        <div class="footer__assurance-item">
          <span class="footer__assurance-icon"><i class="pi pi-headphones"></i></span>
          <div>
            <strong>{{ t('footer.assuranceSupportTitle') }}</strong>
            <span>{{ t('footer.servingHours') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer__main">
      <div class="footer__container">
        <div class="footer__grid">
          <section class="footer__brand" :aria-label="t('footer.brandTagline')">
            <router-link to="/" class="footer__logo">
              <span class="footer__logo-mark"><i class="pi pi-plus"></i></span>
              <span>Pharmacy</span>
            </router-link>
            <p>
              {{ t('footer.about') }}
            </p>
            <div class="footer__socials">
              <a href="#" aria-label="Facebook"><i class="pi pi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i class="pi pi-instagram"></i></a>
              <a href="#" aria-label="YouTube"><i class="pi pi-youtube"></i></a>
            </div>
          </section>

          <section>
            <h2>{{ t('footer.exploreTitle') }}</h2>
            <ul class="footer__links">
              <li><router-link to="/">{{ t('footer.home') }}</router-link></li>
              <li><router-link to="/best-sellers">{{ t('footer.bestSellers') }}</router-link></li>
              <li><router-link to="/cart">{{ t('footer.cart') }}</router-link></li>
              <li><router-link to="/ca-nhan/thong-tin">{{ t('footer.myAccount') }}</router-link></li>
            </ul>
          </section>

          <section>
            <h2>{{ t('footer.supportTitle') }}</h2>
            <ul class="footer__links">
              <li><a href="tel:19006565">{{ t('footer.helpCenter') }}</a></li>
              <li><a href="tel:19006565">{{ t('footer.returnPolicy') }}</a></li>
              <li><a href="tel:19006565">{{ t('footer.shoppingGuide') }}</a></li>
              <li><a href="mailto:support@pharmacy.com">{{ t('footer.faq') }}</a></li>
            </ul>
          </section>

          <section class="footer__contact">
            <h2>{{ t('footer.contactTitle') }}</h2>
            <a class="footer__hotline" href="tel:19006565">
              <i class="pi pi-phone"></i>
              <span><small>{{ t('footer.hotlineLabel') }}</small>1900 6565</span>
            </a>
            <a class="footer__contact-row" href="mailto:support@pharmacy.com">
              <i class="pi pi-envelope"></i>
              <span>support@pharmacy.com</span>
            </a>
            <div class="footer__contact-row">
              <i class="pi pi-map-marker"></i>
              <span>{{ t('footer.address') }}</span>
            </div>
          </section>
        </div>

        <div class="footer__newsletter">
          <div>
            <h2>{{ t('footer.newsletterTitle') }}</h2>
            <p>{{ t('footer.newsletterSubtitle') }}</p>
          </div>
          <form class="footer__signup" @submit.prevent>
            <label class="sr-only" for="footer-email">{{ t('footer.newsletterEmailLabel') }}</label>
            <input id="footer-email" type="email" :placeholder="t('footer.newsletterEmailPlaceholder')"
              autocomplete="email" />
            <button type="submit">{{ t('footer.subscribe') }} <i class="pi pi-arrow-right"></i></button>
          </form>
        </div>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="footer__container footer__bottom-content">
        <p>{{ t('footer.copyright', { year: currentYear }) }}</p>
        <div>
          <span><i class="pi pi-credit-card"></i> {{ t('footer.securePayment') }}</span>
          <span><i class="pi pi-lock"></i> {{ t('footer.dataProtection') }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  color: #d9f7fb;
  background: #083344;
  font-size: 14px;
}

.footer__container {
  width: min(100% - 32px, 1280px);
  margin: 0 auto;
}

.footer__assurance {
  border-bottom: 1px solid #164e63;
  background: #0c4a6e;
}

.footer__assurance-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.footer__assurance-item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 92px;
  padding: 18px 22px;
  border-right: 1px solid rgb(207 250 254 / 14%);
}

.footer__assurance-item:last-child {
  border-right: 0;
}

.footer__assurance-icon {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  color: #0f766e;
  background: #ccfbf1;
  font-size: 17px;
}

.footer__assurance-item strong,
.footer__assurance-item span:not(.footer__assurance-icon) {
  display: block;
}

.footer__assurance-item strong {
  margin-bottom: 3px;
  color: #fff;
  font-weight: 700;
}

.footer__assurance-item span:not(.footer__assurance-icon) {
  color: #a5f3fc;
  font-size: 12px;
}

.footer__main {
  padding: 56px 0 32px;
}

.footer__grid {
  display: grid;
  grid-template-columns: 1.25fr 0.8fr 0.9fr 1.15fr;
  gap: 40px;
}

.footer h2 {
  margin: 7px 0 19px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.footer__logo {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 18px;
  color: #fff;
  font-family: Figtree, Arial, sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
}

.footer__logo-mark {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 9px;
  color: #fff;
  background: #0d9488;
  font-size: 17px;
}

.footer__brand p {
  max-width: 290px;
  margin: 0;
  color: #a5dce5;
  line-height: 1.75;
}

.footer__socials {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.footer__socials a {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #1e6074;
  border-radius: 50%;
  color: #d9f7fb;
  text-decoration: none;
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.footer__socials a:hover {
  border-color: #14b8a6;
  color: #fff;
  background: #0d9488;
}

.footer__links {
  display: grid;
  gap: 13px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.footer__links a {
  color: #a5dce5;
  text-decoration: none;
  transition: color 180ms ease;
}

.footer__links a:hover {
  color: #5eead4;
}

.footer__hotline,
.footer__contact-row {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  color: #bde7ed;
  text-decoration: none;
}

.footer__hotline {
  margin-bottom: 15px;
  color: #fff;
}

.footer__hotline>i {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 50%;
  color: #0f766e;
  background: #ccfbf1;
}

.footer__hotline small,
.footer__hotline span {
  display: block;
}

.footer__hotline small {
  margin-bottom: 2px;
  color: #a5dce5;
  font-size: 11px;
}

.footer__hotline span {
  font-family: Figtree, Arial, sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.footer__contact-row {
  margin-top: 11px;
  line-height: 1.5;
}

.footer__contact-row>i {
  width: 16px;
  margin-top: 3px;
  color: #5eead4;
}

.footer__newsletter {
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: space-between;
  margin-top: 46px;
  padding: 24px 26px;
  border: 1px solid #1e6074;
  border-radius: 14px;
  background: rgb(8 71 91 / 55%);
}

.footer__newsletter h2 {
  margin: 0 0 4px;
}

.footer__newsletter p {
  margin: 0;
  color: #a5dce5;
}

.footer__signup {
  display: flex;
  min-width: min(100%, 415px);
  overflow: hidden;
  border-radius: 9px;
  background: #fff;
}

.footer__signup input {
  width: 100%;
  min-width: 0;
  padding: 12px 14px;
  border: 0;
  color: #164e63;
  outline: 0;
}

.footer__signup button {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 15px;
  border: 0;
  color: #fff;
  background: #0d9488;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.footer__signup button:hover {
  background: #0f766e;
}

.footer__bottom {
  border-top: 1px solid #164e63;
  color: #8dc9d3;
  background: #062936;
  font-size: 12px;
}

.footer__bottom-content,
.footer__bottom-content>div {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.footer__bottom-content {
  min-height: 64px;
}

.footer__bottom p {
  margin: 0;
}

.footer__bottom-content>div {
  gap: 18px;
}

.footer__bottom span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.footer__bottom i {
  color: #5eead4;
}

@media (max-width: 900px) {
  .footer__assurance-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer__assurance-item:nth-child(2) {
    border-right: 0;
  }

  .footer__assurance-item:nth-child(-n + 2) {
    border-bottom: 1px solid rgb(207 250 254 / 14%);
  }

  .footer__grid {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 34px;
  }

  .footer__newsletter {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {

  .footer__assurance-grid,
  .footer__grid {
    grid-template-columns: 1fr;
  }

  .footer__assurance-item,
  .footer__assurance-item:nth-child(2) {
    min-height: 72px;
    padding: 14px 0;
    border-right: 0;
    border-bottom: 1px solid rgb(207 250 254 / 14%);
  }

  .footer__assurance-item:last-child {
    border-bottom: 0;
  }

  .footer__main {
    padding-top: 40px;
  }

  .footer__grid {
    gap: 28px;
  }

  .footer__newsletter {
    gap: 18px;
    margin-top: 34px;
    padding: 20px;
  }

  .footer__signup {
    width: 100%;
  }

  .footer__bottom-content,
  .footer__bottom-content>div {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer__bottom-content {
    gap: 10px;
    padding: 17px 0;
  }

  .footer__bottom-content>div {
    gap: 7px;
  }
}
</style>
