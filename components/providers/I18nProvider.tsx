"use client"

import React, { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'

interface Props {
  locale: string
  messages: Record<string, any>
  children: ReactNode
}

export default function I18nProvider({ locale, messages, children }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
