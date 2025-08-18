import ThemeToggle from '@/components/settings/ThemeToggle'
import AccentPicker from '@/components/settings/AccentPicker'
import FontSizeStepper from '@/components/settings/FontSizeStepper'

export default function PreferencesPage(){
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Preferences</h1>
      <section className="space-y-3"><h2 className="text-sm font-medium">Theme</h2><ThemeToggle/></section>
      <section className="space-y-3"><h2 className="text-sm font-medium">Accent</h2><AccentPicker/></section>
      <section className="space-y-3"><h2 className="text-sm font-medium">Text Size</h2><FontSizeStepper/></section>
    </div>
  )
}
