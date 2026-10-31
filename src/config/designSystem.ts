import { theme } from 'ant-design-vue'

export const pharmacyTheme = {
  token: {
    colorPrimary: '#059669',
    colorInfo: '#0891B2',
    colorLink: '#0891B2',
    colorText: '#164E63',
    colorTextSecondary: '#475569',
    colorBgLayout: '#ECFEFF',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#A5F3FC',
    colorError: '#DC2626',
    borderRadius: 8,
    borderRadiusLG: 12,
    controlHeight: 44,
    controlHeightSM: 32,
    controlHeightLG: 48,
    fontFamily: '"Noto Sans", Arial, sans-serif',
  },
}

export const pharmacyDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...pharmacyTheme.token,
    colorPrimary: '#10B981',
    colorInfo: '#22D3EE',
    colorLink: '#67E8F9',
    colorText: '#E2F3F7',
    colorTextSecondary: '#9FB6C0',
    colorBgLayout: '#0B1720',
    colorBgContainer: '#12232D',
    colorBgElevated: '#16293A',
    colorBorder: '#24404E',
    colorError: '#F87171',
  },
}
