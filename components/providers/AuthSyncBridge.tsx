"use client";
import { useAuthSync } from '@/lib/auth/useAuthSync'
export default function AuthSyncBridge(){
  useAuthSync()
  return null
}
