'use client'

import React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useTranslation } from '@/app/hooks/use-translations'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/app/components/ui/sheet'
import { useStore } from '@/app/lib/store'
import { setLanguagePreference } from '@/app/lib/cookies'
import { ThemeSwitch } from '@/app/components/theme-switch'

// Flag SVG Components
const VietnamFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" fill="#DA251D"/>
    <path d="M12 3L13.2 6.6H17L14 8.8L15.2 12.4L12 10.2L8.8 12.4L10 8.8L7 6.6H10.8L12 3Z" fill="#FFFF00"/>
  </svg>
)

const USFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" fill="#B22234"/>
    <rect y="1.23" width="24" height="1.23" fill="white"/>
    <rect y="3.69" width="24" height="1.23" fill="white"/>
    <rect y="6.15" width="24" height="1.23" fill="white"/>
    <rect y="8.62" width="24" height="1.23" fill="white"/>
    <rect y="11.08" width="24" height="1.23" fill="white"/>
    <rect y="13.54" width="24" height="1.23" fill="white"/>
    <rect width="9.6" height="8.62" fill="#3C3B6E"/>
  </svg>
)

export function MobileMenu() {
  const { language, setLanguage } = useStore()
  const { t } = useTranslation()
  const [mounted, setMounted] = React.useState(false)
  
  // Effect runs only on the client after hydration is complete
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const toggleLanguage = () => {
    if (!mounted) return

    const newLanguage = language === 'en' ? 'vi' : 'en'
    
    // Save to cookie first
    try {
      setLanguagePreference(newLanguage)
      // Log for debugging
      console.log(`Language toggle: changed to ${newLanguage}, cookie set`)
    } catch (e) {
      console.error('Error setting language cookie:', e)
    }
    
    // Then update the store
    setLanguage(newLanguage)
  }

  // Custom navigation function to handle direct navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault() // Prevent default link behavior
    window.location.href = path // Use direct navigation
  }
  
  // Render a language toggle placeholder during server rendering
  const renderLanguageToggle = () => {
    if (!mounted) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-1.5 h-9 w-20 rounded-full border-2 hover:border-primary transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center gap-2 justify-center w-full">
            <div className="w-6 h-4" />
            <span className="font-medium">--</span>
          </div>
        </Button>
      );
    }
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-3 py-1.5 h-9 w-20 rounded-full border-2 hover:border-primary transition-all duration-200 hover:scale-105"
      >
        <div className="flex items-center gap-2 justify-center w-full">
          {language === 'en' ? (
            <>
              <USFlag />
              <span className="font-medium">EN</span>
            </>
          ) : (
            <>
              <VietnamFlag />
              <span className="font-medium">VN</span>
            </>
          )}
        </div>
      </Button>
    );
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px]">
        <SheetHeader>
          <SheetTitle className="text-center">{t('menu')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {/* Payment */}
          <a 
            href="/payment/" 
            onClick={(e) => handleNavigation(e, '/payment/')}
            className="flex items-center px-2 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            {t('payment')}
          </a>
          
          {/* Contact */}
          <a 
            href="/social/" 
            onClick={(e) => handleNavigation(e, '/social/')}
            className="flex items-center px-2 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            {t('contact')}
          </a>
          
          {/* Tools */}
          <a 
            href="/service/" 
            onClick={(e) => handleNavigation(e, '/service/')}
            className="flex items-center px-2 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            {t('tools')}
          </a>
          
          {/* FAQ */}
          <a 
            href="/faq/" 
            onClick={(e) => handleNavigation(e, '/faq/')}
            className="flex items-center px-2 py-2 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
          >
            FAQ
          </a>
          
          {/* Divider */}
          <div className="border-t my-2"></div>
          
          {/* Theme toggle */}
          <div className="flex items-center justify-between px-2 py-2">
            <span>{t('theme')}</span>
            <ThemeSwitch />
          </div>
          
          {/* Language toggle - at the bottom */}
          <div className="mt-auto border-t pt-4 px-2">
            <div className="flex items-center justify-center">
              {renderLanguageToggle()}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 